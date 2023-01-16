import { Strategy } from ".";
import { isSome } from "../combinatorics";
import { Board, CELLS, Candidate, neighborsOf, newCandidate } from "../sudoku";

export const reviseNotes: Strategy = {
    name: "revise notes",
    func: (board: Board) => {
        const eliminations = new Array<Candidate>();

        for (const cell of CELLS) {
            const cellData = board.data[cell];

            if (cellData.hasDigit()) {
                continue;
            }

            const cellEliminations = neighborsOf(cell)
                .map(neighbor => board.data[neighbor].digit)
                .filter(isSome)
                .filter(digit => cellData.hasCandidate(digit))
                .map(digit => newCandidate(cell, digit));

            eliminations.push(...cellEliminations);
        }

        return eliminations.length > 0 ?
            { eliminations } :
            undefined;
    },
};
