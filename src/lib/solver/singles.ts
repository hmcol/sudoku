import { Board, CELLS, DIGITS, CellDigitPair, UNITS } from "../sudoku";
import { StrategyFunction } from "./types";

export const fullHouse: StrategyFunction = (board: Board) => {
    const solutions = new Array<CellDigitPair>();

    for (const unit of UNITS) {
        const unsolvedCells = unit.filter(id => !board.cell(id).hasDigit());

        if (unsolvedCells.length !== 1) {
            continue;
        }

        const id = unsolvedCells[0];
        const digit = board.cell(id).candidates[0]; // should be true if notes are correct

        solutions.push([id, digit]);
    }

    return solutions.length > 0 ?
        { solutions } :
        undefined;
};

export const hiddenSingle: StrategyFunction = (board: Board) => {
    const solutions = new Array<CellDigitPair>();

    for (const digit of DIGITS) {
        for (const unit of UNITS) {
            const candidateCells = unit.filter((id) => board.cell(id).hasCandidate(digit)
            );

            if (candidateCells.length === 1) {
                solutions.push([candidateCells[0], digit]);
            }
        }
    }

    return solutions.length > 0 ?
        { solutions } :
        undefined;
};

export const nakedSingle: StrategyFunction = (board: Board) => {
    const solutions = new Array<CellDigitPair>();

    for (const id of CELLS) {
        const candidates = board.cell(id).candidates;

        if (candidates.length === 1) {
            solutions.push([id, candidates[0]]);
        }
    }

    return solutions.length > 0 ?
        { solutions } :
        undefined;
};