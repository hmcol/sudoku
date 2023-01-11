import { intersection, pairsOf, Graph, Tuple } from "./combinatorics";
import { StrategyFunction, Board, CELLS, cidOf, LINES, DIGITS, FLOORS, TOWERS, cidToPair } from "./sudoku";

type B = 0 | 1;

function flip(b: B): B {
    return b === 0 ? 1 : 0;
} 

type V = Tuple<B, 3>;

function idOf([x, y, z]: V) {
    return `${x}${y}${z}`;
}

// this checks for the most general case, but it would be more useful to first
// check for easy specific cases
export const uniqueRectangle: StrategyFunction = (board: Board) => {
    // make link graph
    const g = new Graph();

    // bivalue
    for (const id of CELLS) {
        const candidates = board.cell(id).candidates;

        if (candidates.length === 2) {
            g.addEdge(cidOf(id, candidates[0]), cidOf(id, candidates[1]));
        }
    }

    // line bilocal
    for (const line of LINES) {
        for (const digit of DIGITS) {
            const candidateCells = line.filter(board.cellHasCandidate(digit));

            if (candidateCells.length === 2) {
                g.addEdge(cidOf(candidateCells[0], digit), cidOf(candidateCells[1], digit));
            }
        }
    }

    // find rectangles
    const cubes = [];

    for (const [upFloor, downFloor] of pairsOf(FLOORS)) {
        for (const upWall of upFloor) {
            for (const downWall of downFloor) {
                for (const [leftWall, rightWall] of TOWERS.map(pairsOf).flat()) {
                    const ulCell = intersection(upWall, leftWall)[0];
                    const urCell = intersection(upWall, rightWall)[0];
                    const dlCell = intersection(downWall, leftWall)[0];
                    const drCell = intersection(downWall, rightWall)[0];

                    for (const [a, b] of pairsOf(DIGITS)) {
                        cubes.push([
                            [
                                [cidOf(ulCell, a), cidOf(ulCell, b)],
                                [cidOf(urCell, a), cidOf(urCell, b)],
                            ],
                            [
                                [cidOf(dlCell, a), cidOf(dlCell, b)],
                                [cidOf(drCell, a), cidOf(drCell, b)],
                            ],
                        ]);
                    }
                }
            }
        }
    }



    for (const cube of cubes) {
        for (const i of [0, 1] as const) {
            for (const j of [0, 1] as const) {
                for (const k of [0, 1] as const) {
                    const vertexToId = ([x, y, z]: V) => (
                        cube[x === 0 ? i : 1 - i][y === 0 ? j : 1 - j][z === 0 ? k : 1 - k]
                    );

                    const edge = (v1: V, v2: V) => g.hasEdge(vertexToId(v1), vertexToId(v2));

                    // breadth-first alternating search
                    const queue: [V, "strong" | "weak"][] = [];
                    const visited = new Set<string>();

                    queue.push([[0, 0, 0], "weak"]);

                    while (queue.length > 0) {
                        const [u, nextLink] = queue.shift()!;

                        visited.add(idOf(u));

                        let adjacentVertices: V[] = [
                            [flip(u[0]), u[1], u[2]],
                            [u[0], flip(u[1]), u[2]],
                            [u[0], u[1], flip(u[2])]
                        ];

                        if (nextLink === "strong") {
                            adjacentVertices = adjacentVertices.filter(v => edge(u, v));
                        }

                        for (const v of adjacentVertices) {
                            if (visited.has(idOf(v))) {
                                continue;
                            }

                            queue.push([
                                v,
                                nextLink === "strong" ? "weak" : "strong",
                            ]);
                        }
                    }

                    // check if "deadly" friends were found in the search
                    if (visited.has("110") && visited.has("101") && visited.has("011")) {
                        const [id, digit] = cidToPair(cube[i][j][k]);

                        if (board.cell(id).hasCandidate(digit)) {
                            return {
                                eliminations: [[id, digit]],
                                highlights: cube.flat().flat().map(cidToPair),
                            };
                        }
                    }
                };
            }
        }
    }

    return undefined;
};
