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

        const [bugCell] = nonBivalueCells;

        const bugCandidates = board.cell(bugCell).candidates;

        if (bugCandidates.length !== 3) {
            return undefined;
        }

        digitLoop: 
        for (const digit of bugCandidates) {
            for (const unit of UNITS.filter(contains(bugCell))) {
                const count = unit.filter(board.cellHasCandidate(digit)).length;

                if (count !== 3) {
                    continue digitLoop;
                }                
            }

            return {
                solutions: [[bugCell, digit]],
            };
        }

        return undefined;
    },
};
