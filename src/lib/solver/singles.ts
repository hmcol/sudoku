import { Strategy } from ".";
import { Board, CELLS, DIGITS, UNITS, Candidate, newCandidate } from "../sudoku";

export const fullHouse: Strategy = {
    name: "full house",
    func: (board: Board) => {
        const solutions = new Array<Candidate>();

        for (const unit of UNITS) {
            const unsolvedCells = unit.filter(id => !board.cell(id).hasDigit());

            if (unsolvedCells.length !== 1) {
                continue;
            }

            const [cell] = unsolvedCells;

            const digit = board.data[cell].candidates[0]; // should be true if notes are correct

            solutions.push(newCandidate(cell, digit));
        }

        return solutions.length > 0 ?
            { solutions } :
            undefined;
    },
};

export const hiddenSingle: Strategy = {
    name: "hidden single",
    func: (board: Board) => {
        const solutions = new Array<Candidate>();

        for (const digit of DIGITS) {
            for (const unit of UNITS) {
                const candidateCells = unit.filter(cell =>
                    board.data[cell].hasCandidate(digit)
                );

                if (candidateCells.length === 1) {
                    solutions.push(newCandidate(candidateCells[0], digit));
                }
            }
        }

        return solutions.length > 0 ?
            { solutions } :
            undefined;
    },
};

export const nakedSingle: Strategy = {
    name: "naked single",
    func: (board: Board) => {
        const solutions = new Array<Candidate>();

        for (const cell of CELLS) {
            const candidates = board.data[cell].candidates;

            if (candidates.length === 1) {
                solutions.push(newCandidate(cell, candidates[0]));
            }
        }

        return solutions.length > 0 ?
            { solutions } :
            undefined;
    },
};
