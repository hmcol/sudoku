import { isSubset, notIn, tuplesOf } from "../combinatorics";
import { Board, DIGITS, CellDigitPair, COLUMNS, ROWS } from "../sudoku";
import { StrategyFunction } from "./types";

export const xWing = makeBasicFish(2);
export const swordfish = makeBasicFish(3);
export const jellyfish = makeBasicFish(4);

function makeBasicFish(n: 2 | 3 | 4): StrategyFunction {
    return (board: Board) => {
        for (const digit of DIGITS) {
            for (const [baseType, coverType] of [[COLUMNS, ROWS], [ROWS, COLUMNS]]) {
                const baseTypeFiltered = baseType.filter(unit => unit.some(board.cellHasCandidate(digit))
                );

                for (const baseUnits of tuplesOf(n, baseTypeFiltered)) {
                    const candidateCells = baseUnits.flat().filter(board.cellHasCandidate(digit));

                    for (const coverUnits of tuplesOf(n, coverType)) {
                        if (!isSubset(candidateCells, coverUnits.flat())) {
                            continue;
                        }

                        const targets = coverUnits
                            .flat()
                            .filter(notIn(candidateCells))
                            .filter(board.cellHasCandidate(digit));

                        if (targets.length > 0) {
                            return {
                                eliminations: targets.map(id => [id, digit] as CellDigitPair),
                                highlights: candidateCells.map(id => [id, digit] as CellDigitPair),
                            };
                        }
                    }
                }
            }
        }

        return undefined;
    };
}
