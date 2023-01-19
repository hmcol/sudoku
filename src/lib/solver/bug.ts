import { Strategy } from ".";
import { contains } from "../util/combinatorics";
import { isNone } from "../util/option";
import { Board, CELLS, Cell, UNITS, newCandidate } from "../sudoku";

export const bugPlusOne: Strategy = {
    name: "bug + 1",
    func: (board: Board) => {
        const nonBivalueCells = CELLS
            .filter(cell => board.data[cell].isUnsolved())
            .filter(cell => board.data[cell].numberOfCandidates !== 2);

        if (nonBivalueCells.length !== 1) {
            return undefined;
        }

        const [bugCell] = nonBivalueCells;

        const bugCandidates = board.data[bugCell].candidates;

        if (bugCandidates.length !== 3) {
            return undefined;
        }

        const bugCellUnits = UNITS.filter(contains(bugCell));

        const bugDigit = bugCandidates.find(digit =>
            bugCellUnits.every(unit =>
                unit.filter(cell => board.data[cell].hasCandidate(digit)).length === 3
            )
        );

        if (isNone(bugDigit)) {
            return undefined;
        }

        return {
            solutions: [newCandidate(bugCell, bugDigit)],
        };
    },
};
