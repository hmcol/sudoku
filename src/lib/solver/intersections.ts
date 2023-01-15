import { Strategy } from ".";
import { hasSubset, isNone, notIn } from "../combinatorics";
import { Board, Cell, DIGITS, CellDigitPair, BOXES, LINES } from "../sudoku";

export const intersectionPointing: Strategy = {
    name: "intersection pointing",
    func: makeIntersection(BOXES, LINES),
};

export const intersectionClaiming: Strategy = {
    name: "intersection claiming",
    func: makeIntersection(LINES, BOXES),
};

function makeIntersection(baseType: Cell[][], coverType: Cell[][]) {
    return (board: Board) => {
        for (const digit of DIGITS) {
            for (const baseUnit of baseType) {
                const candidateCells = baseUnit.filter(id =>
                    board.cell(id).hasCandidate(digit)
                );

                if (candidateCells.length < 2) {
                    continue;
                }

                const coverUnit = coverType.find(hasSubset(candidateCells));

                if (isNone(coverUnit)) {
                    continue;
                }

                const eliminations = coverUnit
                    .filter(notIn(candidateCells))
                    .filter(id => board.cell(id).hasCandidate(digit))
                    .map(id => [id, digit] as CellDigitPair);

                if (eliminations.length === 0) {
                    continue;
                }

                return {
                    eliminations,
                    highlights: candidateCells.map(id => [id, digit] as CellDigitPair),
                };
            }
        }

        return undefined;
    };
}
