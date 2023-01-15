import { notIn, tuplesOf } from "../combinatorics";
import { Board, DIGITS, CellDigitPair, UNITS } from "../sudoku";
import { StrategyFunction } from "./types";

function makeHiddenSubset(n: 2 | 3 | 4): StrategyFunction {
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

                const eliminations = candidateCells.map(id => DIGITS.filter(notIn(candidates))
                    .filter(digit => board.cell(id).hasCandidate(digit))
                    .map(digit => [id, digit] as CellDigitPair)
                ).flat();

                if (eliminations.length > 0) {
                    return {
                        eliminations,
                        highlights: candidateCells.map(id => candidates.map(digit => [id, digit] as CellDigitPair)).flat(),
                    };
                }
            }
        }

        return undefined;
    };
}
export const hiddenPair = makeHiddenSubset(2);
export const hiddenTriple = makeHiddenSubset(3);
export const hiddenQuad = makeHiddenSubset(4);
