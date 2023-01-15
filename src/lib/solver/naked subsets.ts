import { Strategy } from ".";
import { tuplesOf } from "../combinatorics";
import { Board, DIGITS, CellDigitPair, UNITS } from "../sudoku";

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
            const unitFiltered = unit.filter(id => !board.cell(id).hasDigit());

            for (const cells of tuplesOf(n, unitFiltered)) {
                const candidates = DIGITS.filter(digit => cells.some(board.cellHasCandidate(digit))
                );

                if (candidates.length !== n) {
                    continue;
                }

                const eliminations = candidates.map(digit =>
                    board.getDigitEliminations(digit, cells)
                ).flat();

                if (eliminations.length === 0) {
                    continue;
                }

                return {
                    eliminations,
                    highlights: cells.map(id => candidates.map(digit => [id, digit] as CellDigitPair)).flat(),
                };
            }
        }

        return undefined;
    };
}
