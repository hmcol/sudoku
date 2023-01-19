import { Strategy } from ".";
import { iterProduct, tuplesOf } from "../util/combinatorics";
import { Board, DIGITS, newCandidate } from "../sudoku";

export const nakedPair: Strategy = {
    name: "naked pair",
    func: makeNakedSubset(2),
};

export const nakedTriple: Strategy = {
    name: "naked triple",
    func: makeNakedSubset(3),
};

export const nakedQuad: Strategy = {
    name: "naked quad",
    func: makeNakedSubset(4),
};

function makeNakedSubset(n: 2 | 3 | 4) {
    return (board: Board) => {
        for (const unit of board.iterUnits()) {
            const unsolvedCells = unit.filter(cell => cell.isUnsolved());

            for (const cellTuple of tuplesOf(n, unsolvedCells)) {
                const digitTuple = DIGITS.filter(digit =>
                    cellTuple.some(cell => cell.hasCandidate(digit))
                );

                if (digitTuple.length !== n) {
                    continue;
                }

                const tupleNeighbors = board.getNeighborsIntersection(...cellTuple);

                const eliminations = iterProduct(tupleNeighbors, digitTuple)
                    .filter(([cell, digit]) => cell.hasCandidate(digit))
                    .map(([cell, digit]) => newCandidate(cell.id, digit));

                if (eliminations.length === 0) {
                    continue;
                }

                const highlights = iterProduct(cellTuple, digitTuple)
                    .filter(([cell, digit]) => cell.hasCandidate(digit))
                    .map(([cell, digit]) => newCandidate(cell.id, digit));

                return {
                    eliminations,
                    highlights,
                };
            }
        }

        return undefined;
    };
}
