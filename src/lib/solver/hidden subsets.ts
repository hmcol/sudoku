import { Strategy } from ".";
import { isIn, notIn, tuplesOf } from "../util/combinatorics";
import { Board, DIGITS, newCandidate } from "../sudoku";

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
        for (const unit of board.units) {
            const unsolvedDigitsInUnit = DIGITS.filter(digit =>
                !unit.some(cell => cell.digit === digit)
            );

            for (const digitTuple of tuplesOf(n, unsolvedDigitsInUnit)) {
                const cellTuple = unit.filter(cell =>
                    digitTuple.some(digit => cell.hasCandidate(digit))
                );

                if (cellTuple.length !== n) {
                    continue;
                }

                const eliminations = cellTuple.flatMap(cell =>
                    cell.candidates
                        .filter(notIn(digitTuple))
                        .map(digit => newCandidate(cell.id, digit))
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

