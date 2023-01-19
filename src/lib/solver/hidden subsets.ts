import { Strategy } from ".";
import { isIn, iterProduct, notIn, tuplesOf } from "../util/combinatorics";
import { Board, DIGITS, UNITS, newCandidate } from "../sudoku";

export const hiddenPair: Strategy = {
    name: "hidden pair",
    func: makeHiddenSubset(2),
};

export const hiddenTriple: Strategy = {
    name: "hidden triple",
    func: makeHiddenSubset(3),
};

export const hiddenQuad: Strategy = {
    name: "hidden quad",
    func: makeHiddenSubset(4),
};

function makeHiddenSubset(n: 2 | 3 | 4) {
    return (board: Board) => {
        for (const unit of UNITS) {
            const unsolvedDigitsInUnit = DIGITS.filter(digit =>
                !unit.some(cell => board.data[cell].digit === digit)
            );

            for (const digitTuple of tuplesOf(n, unsolvedDigitsInUnit)) {
                const cellTuple = unit.filter(cell =>
                    digitTuple.some(digit => board.data[cell].hasCandidate(digit))
                );

                if (cellTuple.length !== n) {
                    continue;
                }

                const eliminations = cellTuple.flatMap(cell =>
                    board.data[cell].candidates
                        .filter(notIn(digitTuple))
                        .map(digit => newCandidate(cell, digit))
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

