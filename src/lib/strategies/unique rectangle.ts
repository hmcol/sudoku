import { Strategy } from ".";
import {
    intersection,
    pairsOf,
    Graph,
    Tuple,
    iterProduct3,
    iterProduct,
    range,
    notIn,
    notEq,
    setEquality,
    hasSubset,
} from "../util/combinatorics";
import { newCandidate, FLOORS, TOWERS, DIGITS, Board } from "../sudoku";
import { Option, isSome } from "../util/option";

// binary type
type B = 0 | 1;

const BS: B[] = [0, 1];

function flip(b: B): B {
    return b === 0 ? 1 : 0;
}

// cube vertex type

type V = Tuple<B, 3>;

function idOf([x, y, z]: V) {
    return `${x}${y}${z}`;
}

const CUBE_INDICES: V[] = iterProduct3(BS, BS, BS);

// shape iterators

const RECTANGLES = (() => {
    const rectangles = [];

    for (const [hChutes, vChutes] of [
        [FLOORS, TOWERS],
        [TOWERS, FLOORS],
    ]) {
        // pairs of "horizontal" lines in different chutes
        const hLinePairs = pairsOf(hChutes)
            .map((pair) => iterProduct(...pair))
            .flat();

        // pairs of "vertical" lines in the same chute
        const vLinePairs = vChutes.map(pairsOf).flat();

        for (const rectangleLines of iterProduct(hLinePairs, vLinePairs)) {
            const [[upLine, downLine], [leftLine, rightLine]] = rectangleLines;

            const ulCell = intersection(upLine, leftLine)[0];
            const urCell = intersection(upLine, rightLine)[0];
            const dlCell = intersection(downLine, leftLine)[0];
            const drCell = intersection(downLine, rightLine)[0];

            rectangles.push([ulCell, urCell, dlCell, drCell]);

            // rectangles.push([
            //     [urCell, drCell],
            //     [ulCell, dlCell],
            // ]);

            // rectangles.push([
            //     [drCell, dlCell],
            //     [urCell, ulCell],
            // ]);

            // rectangles.push([
            //     [dlCell, ulCell],
            //     [drCell, urCell],
            // ]);
        }
    }

    return rectangles;
})();

const CUBES = (() => {
    const cubes = [];

    for (const [ul, ur, dl, dr] of RECTANGLES) {
        for (const [a, b] of pairsOf(DIGITS)) {
            cubes.push([
                [
                    [newCandidate(ul, a), newCandidate(ul, b)],
                    [newCandidate(ur, a), newCandidate(ur, b)],
                ],
                [
                    [newCandidate(dl, a), newCandidate(dl, b)],
                    [newCandidate(dr, a), newCandidate(dr, b)],
                ],
            ]);
        }
    }

    return cubes;
})();

// unique rectangle strategies

export const ur1: Strategy = {
    name: "unique rectangle type 1",
    func: (board: Board) => {
        const cellRectangles = RECTANGLES.map((rect) => rect.map((cell) => board.cells[cell]));

        for (const [rect, ab] of iterProduct(cellRectangles, pairsOf(DIGITS))) {
            const nonBivalueCells = rect.filter((cell) => !setEquality(ab, cell.candidates));

            if (nonBivalueCells.length !== 1) {
                continue;
            }

            const [cell] = nonBivalueCells;

            const eliminations = ab
                .filter((digit) => cell.hasCandidate(digit))
                .map((digit) => newCandidate(cell.id, digit));

            if (eliminations.length === 0) {
                continue;
            }

            const highlights = iterProduct(rect.filter(notEq(cell)), ab).map(([cell, digit]) =>
                newCandidate(cell.id, digit)
            );

            return {
                eliminations,
                highlights,
            };
        }

        return undefined;
    },
};

export const ur2: Strategy = {
    name: "unique rectangle type 2",
    func: (board: Board) => {
        const cellRectangles = RECTANGLES.map((rect) => rect.map((cell) => board.cells[cell]));

        // two non-diagonal ab cells, two abc cells
        // can eliminate c from every cell that sees both abc cells
        for (const [rect, ab] of iterProduct(cellRectangles, pairsOf(DIGITS))) {
            for (const i of range(4)) {
                const bv1 = rect[i];
                if (!setEquality(ab, bv1.candidates)) {
                    continue;
                }

                const bv2 = rect[(i + 1) % 4];
                if (!setEquality(ab, bv2.candidates)) {
                    continue;
                }

                const tv1 = rect[(i + 2) % 4];
                const tv2 = rect[(i + 3) % 4];

                for (const c of DIGITS.filter(notIn(ab))) {
                    const abc = [...ab, c];

                    if (!setEquality(abc, tv1.candidates)) {
                        continue;
                    }

                    if (!setEquality(abc, tv2.candidates)) {
                        continue;
                    }

                    const eliminations = board.getDigitEliminations(c, [tv1.id, tv2.id]);

                    if (eliminations.length === 0) {
                        continue;
                    }

                    const highlights = iterProduct(rect, ab).map(([cell, digit]) =>
                        newCandidate(cell.id, digit)
                    );

                    return {
                        eliminations,
                        highlights,
                        highlights2: [newCandidate(tv1.id, c), newCandidate(tv2.id, c)],
                    };
                }
            }
        }

        return undefined;
    },
};

// const _ur3: Strategy = {
//     name: "unique rectangle type 3",
//     func: (_board: Board) => {
//         // two non-diagonal ab cells, two ab* cells
//         // use * to make naked subset

//         return undefined;
//     },
// };

export const ur4: Strategy = {
    name: "unique rectangle type 4",
    func: (board: Board) => {
        const cellRectangles = RECTANGLES.map((rect) => rect.map((cell) => board.cells[cell]));

        // two non-diagonal ab cells, two ab* cells strongly linked by a
        // can eliminate b from ab* cells
        for (const [rect, ab] of iterProduct(cellRectangles, pairsOf(DIGITS))) {
            for (const i of range(4)) {
                const bv1 = rect[i];
                if (!setEquality(ab, bv1.candidates)) {
                    continue;
                }

                const bv2 = rect[(i + 1) % 4];
                if (!setEquality(ab, bv2.candidates)) {
                    continue;
                }

                const dc1 = rect[(i + 2) % 4];
                const dc2 = rect[(i + 3) % 4];

                for (const unit of board.iterUnits().filter(hasSubset([dc1, dc2]))) {
                    for (const strongDigit of ab) {
                        const candidateCells = unit.filter((cell) =>
                            cell.hasCandidate(strongDigit)
                        );

                        if (!setEquality(candidateCells, [dc1, dc2])) {
                            continue;
                        }

                        const otherDigit = ab.filter(notEq(strongDigit))[0];

                        const eliminations = [dc1, dc2]
                            .filter((cell) => cell.hasCandidate(otherDigit))
                            .map((cell) => newCandidate(cell.id, otherDigit));

                        if (eliminations.length === 0) {
                            continue;
                        }

                        const highlights = iterProduct([bv1, bv2], ab)
                            .concat([
                                [dc1, strongDigit],
                                [dc2, strongDigit],
                            ])
                            .map(([cell, digit]) => newCandidate(cell.id, digit));

                        return {
                            eliminations,
                            highlights,
                        };
                    }
                }
            }
        }

        return undefined;
    },
};

export const ur5: Strategy = {
    name: "unique rectangle type 5",
    func: (board: Board) => {
        const cellRectangles = RECTANGLES.map((rect) => rect.map((cell) => board.cells[cell]));

        // one or two ab cells, two or three abc cells
        // can eliminate c from every cell that sees both abc cells
        for (const [rect, ab] of iterProduct(cellRectangles, pairsOf(DIGITS))) {
            const bivalueCells = rect.filter((cell) => setEquality(ab, cell.candidates));

            if (!(bivalueCells.length === 1 || bivalueCells.length === 2)) {
                continue;
            }
            for (const c of DIGITS.filter(notIn(ab))) {
                const trivalueCells = rect.filter((cell) =>
                    setEquality([...ab, c], cell.candidates)
                );

                if (trivalueCells.length !== 4 - bivalueCells.length) {
                    continue;
                }

                const eliminations = board.getDigitEliminations(
                    c,
                    trivalueCells.map((cell) => cell.id)
                );

                if (eliminations.length === 0) {
                    continue;
                }

                const highlights = iterProduct(rect, ab).map(([cell, digit]) =>
                    newCandidate(cell.id, digit)
                );

                const highlights2 = trivalueCells.map((cell) => newCandidate(cell.id, c));

                return {
                    eliminations,
                    highlights,
                    highlights2,
                };
            }
        }

        return undefined;
    },
};

// const _ur6: Strategy = {
//     name: "unique rectangle type 6",
//     func: (_board: Board) => {
//         // two diagonal ab cells, two diagonal ab* cells
//         // a is strongly linked in both/all units
//         // can eliminate a from ab* cells

//         return undefined;
//     },
// };

// this checks for the most general case, but it would be more useful to first
// check for easy specific cases
export const hiddenRectangle: Strategy = {
    name: "hidden unique rectangle",
    func: (board: Board) => {
        const g = makeStrongLinkGraph(board);

        // find rectangles
        for (const cube of CUBES) {
            for (const [i, j, k] of CUBE_INDICES) {
                const vertexToId = ([x, y, z]: V) =>
                    cube[x === 0 ? i : 1 - i][y === 0 ? j : 1 - j][z === 0 ? k : 1 - k];

                const edge = (v1: V, v2: V) => g.hasEdge(vertexToId(v1), vertexToId(v2));

                // breadth-first alternating search
                type Parity = "strong" | "weak";
                const queue: [V, Parity][] = [];
                const visited = new Set<string>();

                let queueItem: Option<[V, Parity]> = [[0, 0, 0], "weak"];
                while (isSome(queueItem)) {
                    const [u, nextLink] = queueItem;

                    visited.add(idOf(u));

                    let adjacentVertices: V[] = [
                        [flip(u[0]), u[1], u[2]],
                        [u[0], flip(u[1]), u[2]],
                        [u[0], u[1], flip(u[2])],
                    ];

                    if (nextLink === "strong") {
                        adjacentVertices = adjacentVertices.filter((v) => edge(u, v));
                    }

                    for (const v of adjacentVertices) {
                        if (visited.has(idOf(v))) {
                            continue;
                        }

                        queue.push([v, nextLink === "strong" ? "weak" : "strong"]);
                    }

                    queueItem = queue.shift();
                }

                // check if "deadly" friends were found in the search
                if (visited.has("110") && visited.has("101") && visited.has("011")) {
                    const candidate = cube[i][j][k];

                    if (board.hasCandidate(candidate)) {
                        return {
                            eliminations: [candidate],
                            highlights: cube.flat().flat(),
                        };
                    }
                }
            }
        }

        return undefined;
    },
};

function makeStrongLinkGraph(board: Board) {
    const g = new Graph();

    // bivalue
    for (const cell of board.iterCells()) {
        const candidates = cell.candidates;

        if (candidates.length === 2) {
            g.addEdge(newCandidate(cell.id, candidates[0]), newCandidate(cell.id, candidates[1]));
        }
    }

    // line bilocal
    for (const line of board.iterLines()) {
        for (const digit of DIGITS) {
            const candidateCells = line.filter((cell) => cell.hasCandidate(digit));

            if (candidateCells.length === 2) {
                g.addEdge(
                    newCandidate(candidateCells[0].id, digit),
                    newCandidate(candidateCells[1].id, digit)
                );
            }
        }
    }

    return g;
}
