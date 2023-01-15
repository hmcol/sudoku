import { intersection, pairsOf, Graph, Tuple, iterProduct3, iterProduct } from "../combinatorics";
import { CELLS, newCandidate, candidateToPair, LINES, FLOORS, TOWERS, DIGITS,  Board } from "../sudoku";
import { StrategyFunction } from "./types";

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

    for (const [hChutes, vChutes] of [[FLOORS, TOWERS], [TOWERS, FLOORS]]) {
        // pairs of "horizontal" lines in different chutes
        const hLinePairs = pairsOf(hChutes).map(pair => iterProduct(...pair)).flat();

        // pairs of "vertical" lines in the same chute
        const vLinePairs = vChutes.map(pairsOf).flat();

        for (const rectangleLines of iterProduct(hLinePairs, vLinePairs)) {
            const [[upLine, downLine], [leftLine, rightLine]] = rectangleLines;

            const ulCell = intersection(upLine, leftLine)[0];
            const urCell = intersection(upLine, rightLine)[0];
            const dlCell = intersection(downLine, leftLine)[0];
            const drCell = intersection(downLine, rightLine)[0];

            rectangles.push([
                [ulCell, urCell],
                [dlCell, drCell],
            ]);

            rectangles.push([
                [urCell, drCell],
                [ulCell, dlCell],
            ]);

            rectangles.push([
                [drCell, dlCell],
                [urCell, ulCell],
            ]);

            rectangles.push([
                [dlCell, ulCell],
                [drCell, urCell],
            ]);
        }
    }

    return rectangles;
})();

const CUBES = (() => {
    const cubes = [];

    for (const [[ul, ur], [dl, dr]] of RECTANGLES) {
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

const ur1: StrategyFunction = (board: Board) => {
    const g = makeStrongLinkGraph(board);

    for (const [[id00, id01], [id10, id11]] of RECTANGLES) {
        // if (board.cell(id01).candidates.length)
    }

    return undefined;
};


// this checks for the most general case, but it would be more useful to first
// check for easy specific cases
export const uniqueRectangle: StrategyFunction = (board: Board) => {
    const g = makeStrongLinkGraph(board);

    // find rectangles
    for (const cube of CUBES) {
        for (const [i, j, k] of CUBE_INDICES) {

            const vertexToId = ([x, y, z]: V) => (
                cube[x === 0 ? i : 1 - i][y === 0 ? j : 1 - j][z === 0 ? k : 1 - k]
            );

            const edge = (v1: V, v2: V) => g.hasEdge(vertexToId(v1), vertexToId(v2));


            // type 1


        };
    }

    return undefined;
};



function makeStrongLinkGraph(board: Board) {
    const g = new Graph();

    // bivalue
    for (const id of CELLS) {
        const candidates = board.cell(id).candidates;

        if (candidates.length === 2) {
            g.addEdge(newCandidate(id, candidates[0]), newCandidate(id, candidates[1]));
        }
    }

    // line bilocal
    for (const line of LINES) {
        for (const digit of DIGITS) {
            const candidateCells = line.filter(board.cellHasCandidate(digit));

            if (candidateCells.length === 2) {
                g.addEdge(newCandidate(candidateCells[0], digit), newCandidate(candidateCells[1], digit));
            }
        }
    }

    return g;
}

