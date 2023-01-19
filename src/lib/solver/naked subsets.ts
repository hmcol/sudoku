import { Strategy } from ".";
import { isIn, tuplesOf } from "../util/combinatorics";
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
        for (const unit of board.units) {
            const unsolvedCells = unit.filter(cell =>
                cell.isUnsolved()
            );

            for (const cellTuple of tuplesOf(n, unsolvedCells)) {
                const digitTuple = DIGITS.filter(digit =>
                    cellTuple.some(cell => cell.hasCandidate(digit))
                );

                if (digitTuple.length !== n) {
                    continue;
                }

                const eliminations = digitTuple.flatMap(digit =>
                    board.getDigitEliminations(digit, cellTuple.map(cell => cell.id))
                );

                if (eliminations.length === 0) {
                    continue;
                }

                const highlights = cellTuple.flatMap(cell =>
                    cell.candidates
                        .filter(isIn(digitTuple))
                        .map(digit => newCandidate(cell.id, digit))
                );

                return {
                    eliminations,
                    highlights,
                };
            }
        }

        return undefined;
    };
}
