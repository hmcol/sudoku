import { Strategy } from ".";
import { Board, DIGITS, Candidate, newCandidate } from "../sudoku";

export const fullHouse: Strategy = {
    name: "full house",
    func: (board: Board) => {
        const solutions = new Array<Candidate>();

        for (const unit of board.iterUnits()) {
            const unsolvedCells = unit.filter((cell) => cell.isUnsolved());

            if (unsolvedCells.length !== 1) {
                continue;
            }

            const [cell] = unsolvedCells;

            const digit = cell.candidates[0]; // should be true if notes are correct

            solutions.push(newCandidate(cell.id, digit));
        }

        return solutions.length > 0 ? { solutions } : undefined;
    },
};

export const hiddenSingle: Strategy = {
    name: "hidden single",
    func: (board: Board) => {
        const solutions = new Array<Candidate>();

        for (const unit of board.iterUnits()) {
            const unsolvedCells = unit.filter((cell) => cell.isUnsolved());

            for (const digit of DIGITS) {
                const candidateCells = unsolvedCells.filter((cell) => cell.hasCandidate(digit));

                if (candidateCells.length !== 1) {
                    continue;
                }

                const [cell] = candidateCells;

                solutions.push(newCandidate(cell.id, digit));
            }
        }

        return solutions.length > 0 ? { solutions } : undefined;
    },
};

export const nakedSingle: Strategy = {
    name: "naked single",
    func: (board: Board) => {
        const solutions = new Array<Candidate>();

        for (const cell of board.iterCells()) {
            if (cell.numberOfCandidates !== 1) {
                continue;
            }

            const [digit] = cell.candidates;

            solutions.push(newCandidate(cell.id, digit));
        }

        return solutions.length > 0 ? { solutions } : undefined;
    },
};
