import { Strategy } from ".";
import { isSome } from "../util/option";
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

            const neighbors = neighborsOf(cell);

            const cellEliminations = cellData.candidates.filter(digit =>
                neighbors.some(neighbor => board.data[neighbor].digit === digit)
            ).map(digit => newCandidate(cell, digit));

            eliminations.push(...cellEliminations);
        }

        return eliminations.length > 0 ?
            { eliminations } :
            undefined;
    },
};
