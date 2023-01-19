import { Strategy } from ".";
import { hasSubset, notIn } from "../util/combinatorics";
import { isNone } from "../util/option";
import { Board, Cell, DIGITS, BOXES, LINES, newCandidate } from "../sudoku";

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
        for (const x of DIGITS) {
            const hasX = (cell: Cell) => board.data[cell].hasCandidate(x);

            for (const baseUnit of baseType) {
                const xBaseCells = baseUnit.filter(hasX);

                if (xBaseCells.length < 2) {
                    continue;
                }

                const coverUnit = coverType.find(hasSubset(xBaseCells));

                if (isNone(coverUnit)) {
                    continue;
                }

                const coverMinusBaseCells = coverUnit
                    .filter(hasX)
                    .filter(notIn(xBaseCells));

                if (coverMinusBaseCells.length === 0) {
                    continue;
                }

                return {
                    eliminations: coverMinusBaseCells.map(cell => newCandidate(cell, x)),
                    highlights: xBaseCells.map(cell => newCandidate(cell, x)),
                };
            }
        }

        return undefined;
    };
}
