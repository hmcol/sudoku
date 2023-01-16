import { Strategy } from ".";
import { iterProduct, tuplesOf } from "../combinatorics";
import { Board, DIGITS, UNITS, newCandidate } from "../sudoku";

export const nakedPair: Strategy = {
    name: "naked pair",
    func: makeNakedSubset(2),
};

export const nakedTriple: Strategy = {
    name: "naked triple",
    func: makeNakedSubset(3),
};

export const nakedQuad: Strategy = {
    name: "naked quad",
    func: makeNakedSubset(4),
};

function makeNakedSubset(n: 2 | 3 | 4) {
    return (board: Board) => {
        for (const unit of UNITS) {
            const unitFiltered = unit.filter(cell => !board.data[cell].hasDigit());

            for (const cells of tuplesOf(n, unitFiltered)) {
                const candidates = DIGITS.filter(digit => 
                    cells.some(board.cellHasCandidate(digit))
                );

                if (candidates.length !== n) {
                    continue;
                }

                const eliminations = candidates.flatMap(digit =>
                    board.getDigitEliminations(digit, cells)
                );

                if (eliminations.length === 0) {
                    continue;
                }

                const highlights = iterProduct(cells, candidates)
                    .map(([cell, digit]) => newCandidate(cell, digit));

                return {
                    eliminations,
                    highlights,
                };
            }
        }

        return undefined;
    };
}
