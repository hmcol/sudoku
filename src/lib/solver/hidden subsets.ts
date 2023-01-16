import { Strategy } from ".";
import { iterProduct, notIn, tuplesOf } from "../combinatorics";
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
            const digits = DIGITS.filter(digit =>
                unit.every(cell => board.data[cell].digit !== digit)
            );

            for (const candidates of tuplesOf(n, digits)) {
                const candidateCells = unit.filter(id => candidates.some(digit => board.cell(id).hasCandidate(digit)
                )
                );

                if (candidateCells.length !== n) {
                    continue;
                }

                const eliminations = iterProduct(candidateCells, DIGITS.filter(notIn(candidates)))
                    .filter(([cell, digit]) => board.data[cell].hasCandidate(digit))
                    .map(([cell, digit]) => newCandidate(cell, digit));

                if (eliminations.length === 0) {
                    continue;
                }

                const highlights = iterProduct(candidateCells, candidates)
                    .map(([cell, digit]) => newCandidate(cell, digit));

                return {
                    eliminations,
                    highlights,
                };
            }
        }

        return undefined;
    };
}

