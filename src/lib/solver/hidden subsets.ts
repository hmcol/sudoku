import { Strategy } from ".";
import { notIn, tuplesOf } from "../combinatorics";
import { Board, DIGITS, CellDigitPair, UNITS } from "../sudoku";

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
            const digits = DIGITS.filter(digit => unit.every(id => board.cell(id).digit !== digit
            )
            );

            for (const candidates of tuplesOf(n, digits)) {
                const candidateCells = unit.filter(id => candidates.some(digit => board.cell(id).hasCandidate(digit)
                )
                );

                if (candidateCells.length !== n) {
                    continue;
                }

                const eliminations = candidateCells.map(id =>
                    DIGITS.filter(notIn(candidates))
                        .filter(digit => board.cell(id).hasCandidate(digit))
                        .map(digit => [id, digit] as CellDigitPair)
                ).flat();

                if (eliminations.length === 0) {
                    continue;
                }

                return {
                    eliminations,
                    highlights: candidateCells.map(id =>
                        candidates.map(digit => [id, digit] as CellDigitPair)
                    ).flat(),
                };
            }
        }

        return undefined;
    };
}

