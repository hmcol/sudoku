import { Strategy } from ".";
import { isSome } from "../combinatorics";
import { Board, CELLS, CellDigitPair, neighborsOf } from "../sudoku";

export const reviseNotes: Strategy = {
    name: "revise notes",
    func: (board: Board) => {
        const eliminations = new Array<CellDigitPair>();

        for (const cell of CELLS) {
            const cellData = board.cell(cell);

            if (cellData.hasDigit()) {
                continue;
            }

            const cellEliminations = neighborsOf(cell)
                .map(neighbor => board.cell(neighbor).digit)
                .filter(isSome)
                .filter(digit => cellData.hasCandidate(digit))
                .map(digit => [cell, digit] as CellDigitPair);

            eliminations.push(...cellEliminations);
        }

        return eliminations.length > 0 ?
            { eliminations } :
            undefined;
    },
};
