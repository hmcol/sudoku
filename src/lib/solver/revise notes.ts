import { Board, CELLS, CellDigitPair, UNITS } from "../sudoku";
import { contains, isSome } from "../combinatorics";
import { StrategyFunction } from "./types";

export const reviseNotes: StrategyFunction = (board: Board) => {
    const eliminations = new Array<CellDigitPair>();

    for (const id of CELLS) {
        const cell = board.cell(id);

        if (cell.hasDigit()) {
            continue;
        }

        for (const id2 of UNITS.filter(contains(id)).flat()) {
            const digit = board.cell(id2).digit;

            if (isSome(digit) && cell.hasCandidate(digit)) {
                eliminations.push([id, digit]);
            }
        }
    }

    return eliminations.length > 0 ?
        { eliminations } :
        undefined;
};
