import { Strategy } from ".";
import { isIn, iterProduct, tuplesOf } from "../util/combinatorics";
import { Board, DIGITS, UNITS, newCandidate } from "../sudoku";

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
        for (const unit of UNITS) {
            const unitFiltered = unit.filter(cell =>
                board.data[cell].isUnsolved()
            );

            for (const cellTuple of tuplesOf(n, unitFiltered)) {
                const digitTuple = DIGITS.filter(digit =>
                    cellTuple.some(cell => board.data[cell].hasCandidate(digit))
                );

                if (digitTuple.length !== n) {
                    continue;
                }

                const eliminations = digitTuple.flatMap(digit =>
                    board.getDigitEliminations(digit, cellTuple)
                );

                if (eliminations.length === 0) {
                    continue;
                }

                const highlights = cellTuple.flatMap(cell =>
                    board.data[cell].candidates
                        .filter(isIn(digitTuple))
                        .map(digit => newCandidate(cell, digit))
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
