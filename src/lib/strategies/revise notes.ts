import { Strategy } from ".";
import { Board, Candidate, newCandidate } from "../sudoku";

export const reviseNotes: Strategy = {
    name: "revise notes",
    func: (board: Board) => {
        const eliminations = new Array<Candidate>();

        for (const cell of board.iterCells()) {
            if (cell.hasDigit()) {
                continue;
            }

            const neighbors = board.getNeighbors(cell);

            const cellEliminations = cell.candidates
                .filter(digit =>
                    neighbors.some(neighbor => neighbor.digit === digit)
                )
                .map(digit => newCandidate(cell.id, digit));

            eliminations.push(...cellEliminations);
        }

        return eliminations.length > 0 ?
            { eliminations } :
            undefined;
    },
};
