import { Strategy } from ".";
import { contains } from "../combinatorics";
import { Board, CELLS, UNITS } from "../sudoku";

export const bugPlusOne: Strategy = {
    name: "bug + 1",
    func: (board: Board) => {
        const nonBivalueCells = CELLS
            .filter(id => !board.cell(id).hasDigit())
            .filter(id => board.cell(id).candidates.length !== 2);

        if (nonBivalueCells.length !== 1) {
            return undefined;
        }

        const bugId = nonBivalueCells[0];

        const bugCandidates = board.cell(bugId).candidates;

        if (bugCandidates.length !== 3) {
            return undefined;
        }

        for (const digit of bugCandidates) {
            for (const unit of UNITS.filter(contains(bugId))) {
                const count = unit.filter(board.cellHasCandidate(digit)).length;

                if (count !== 3) {
                    break;
                }

                return {
                    solutions: [[bugId, digit]],
                };
            }
        }

        return undefined;
    },
};
