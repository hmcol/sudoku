import { tuplesOf } from "../combinatorics";
import { Board, DIGITS, CellDigitPair, UNITS } from "../sudoku";
import { StrategyFunction } from "./types";

export const nakedPair = makeNakedSubset(2);
export const nakedTriple = makeNakedSubset(3);
export const nakedQuad = makeNakedSubset(4);

function makeNakedSubset(n: 2 | 3 | 4): StrategyFunction {
    return (board: Board) => {
        for (const unit of UNITS) {
            const unitFiltered = unit.filter(id => !board.cell(id).hasDigit());

            for (const cells of tuplesOf(n, unitFiltered)) {
                const candidates = DIGITS.filter(digit => cells.some(board.cellHasCandidate(digit))
                );

                if (candidates.length !== n) {
                    continue;
                }

                const eliminations = candidates.map(digit => board.getDigitEliminations(digit, cells)
                ).flat();

                if (eliminations.length > 0) {
                    return {
                        eliminations,
                        highlights: cells.map(id => candidates.map(digit => [id, digit] as CellDigitPair)).flat(),
                    };
                }
            }
        }

        return undefined;
    };
}
