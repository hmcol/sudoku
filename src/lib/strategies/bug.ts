import { Strategy } from ".";
import { contains } from "../util/combinatorics";
import { isNone } from "../util/option";
import { Board, newCandidate } from "../sudoku";

export const bugPlusOne: Strategy = {
    name: "bug + 1",
    func: (board: Board) => {
        const nonBivalueCells = board.iterCells()
            .filter(cell => cell.isUnsolved())
            .filter(cell => cell.numberOfCandidates !== 2);

        if (nonBivalueCells.length !== 1) {
            return undefined;
        }

        const [bugCell] = nonBivalueCells;

        if (bugCell.numberOfCandidates !== 3) {
            return undefined;
        }

        const bugCellUnits = board.iterUnits().filter(contains(bugCell));

        const bugDigit = bugCell.candidates.find(digit =>
            bugCellUnits.every(unit =>
                unit.filter(cell => cell.hasCandidate(digit)).length === 3
            )
        );

        if (isNone(bugDigit)) {
            return undefined;
        }

        return {
            solutions: [newCandidate(bugCell.id, bugDigit)],
        };
    },
};
