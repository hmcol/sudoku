import { hasSubset, isNone, notIn } from "../combinatorics";
import { Board, Cell, DIGITS, CellDigitPair, BOXES, LINES } from "../sudoku";
import { StrategyFunction } from "./types";

export const intersectionPointing = makeIntersection(BOXES, LINES);
export const intersectionClaiming = makeIntersection(LINES, BOXES);

function makeIntersection(baseType: Cell[][], coverType: Cell[][]): StrategyFunction {
    return (board: Board) => {
        for (const digit of DIGITS) {
            for (const baseUnit of baseType) {
                const candidateCells = baseUnit.filter((id) => board.cell(id).hasCandidate(digit)
                );

                if (candidateCells.length < 2) {
                    continue;
                }

                const coverUnit = coverType.find(hasSubset(candidateCells));

                if (isNone(coverUnit)) {
                    continue;
                }

                const targets = coverUnit
                    .filter(notIn(candidateCells))
                    .filter(id => board.cell(id).hasCandidate(digit));

                if (targets.length > 0) {
                    return {
                        eliminations: targets.map(id => [id, digit] as CellDigitPair),
                        highlights: candidateCells.map(id => [id, digit] as CellDigitPair),
                    };
                }
            }
        }

        return undefined;
    };
}
