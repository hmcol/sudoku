import { Strategy } from ".";
import { Board, CELLS, DIGITS, UNITS, Candidate, newCandidate } from "../sudoku";

export const fullHouse: Strategy = {
    name: "full house",
    func: (board: Board) => {
        const solutions = new Array<Candidate>();

        for (const unit of UNITS) {
            const unsolvedCells = unit.filter(cell =>
                board.data[cell].isUnsolved()
            );

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

        for (const unit of UNITS) {
            const unsolvedCells = unit.filter(cell =>
                board.data[cell].isUnsolved()
            );

            for (const digit of DIGITS) {
                const candidateCells = unsolvedCells.filter(cell =>
                    board.data[cell].hasCandidate(digit)
                );

                if (candidateCells.length !== 1) {
                    continue;
                }

                const [cell] = candidateCells;

                solutions.push(newCandidate(cell, digit));
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
            const candidateDigits = board.data[cell].candidates;

            if (candidateDigits.length !== 1) {
                continue;
            }

            const [digit] = candidateDigits;

            solutions.push(newCandidate(cell, digit));
        }

        return solutions.length > 0 ?
            { solutions } :
            undefined;
    },
};
