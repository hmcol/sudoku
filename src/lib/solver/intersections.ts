import { Strategy } from ".";
import { hasSubset, notIn } from "../util/combinatorics";
import { isNone } from "../util/option";
import { Board, DIGITS, newCandidate, Cell, UnitType } from "../sudoku";

export const intersectionPointing: Strategy = {
    name: "intersection pointing",
    func: makeIntersection("boxes", "lines"),
};

export const intersectionClaiming: Strategy = {
    name: "intersection claiming",
    func: makeIntersection("lines", "boxes"),
};

function makeIntersection(baseType: UnitType, coverType: UnitType) {
    return (board: Board) => {
        for (const x of DIGITS) {
            const hasX = (cell: Cell) => cell.hasCandidate(x);

            for (const baseUnit of board[baseType]) {
                const xBaseCells = baseUnit.filter(hasX);

                if (xBaseCells.length < 2) {
                    continue;
                }

                const coverUnit = board[coverType].find(hasSubset(xBaseCells));

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
                    eliminations: coverMinusBaseCells.map(cell => newCandidate(cell.id, x)),
                    highlights: xBaseCells.map(cell => newCandidate(cell.id, x)),
                };
            }
        }

        return undefined;
    };
}
