import { intersection, isSubset, notEqual, notIn, pairsOf } from "../combinatorics";
import { Board, CELLS, DIGITS, UNITS } from "../sudoku";
import { StrategyFunction } from "./types";
import { makeBasicChain } from "./chains";

export const yWing = makeBasicChain(["bivalue"], ["weakUnit"], 6, 6);

export const xyzWing: StrategyFunction = (board: Board) => {
    for (const xyzId of CELLS) {
        const xyz = board.cell(xyzId).candidates;

        if (xyz.length !== 3) {
            continue;
        }

        const bivalueNeighbors = board.getVisible(xyzId)
            .filter(id => board.cell(id).candidates.length === 2)
            .filter(id => isSubset(board.cell(id).candidates, xyz));

        for (const [xzId, yzId] of pairsOf(bivalueNeighbors)) {
            const xz = board.cell(xzId).candidates;
            const yz = board.cell(yzId).candidates;

            if (isSubset(xz, yz)) {
                continue;
            }

            const z = intersection(xz, yz)[0];

            const eliminations = board.getDigitEliminations(z, [xyzId, xzId, yzId]);

            if (eliminations.length > 0) {
                const x = xz.filter(notEqual(z))[0];
                const y = yz.filter(notEqual(z))[0];

                return {
                    eliminations,
                    highlights: [[xyzId, x], [xyzId, y], [xyzId, z], [xzId, x], [xzId, z], [yzId, y], [yzId, z]],
                };
            }
        }

    }

    return undefined;
};

export const wWing: StrategyFunction = (board: Board) => {
    for (const x of DIGITS) {
        for (const baseUnit of UNITS) {
            const xCells = baseUnit.filter(board.cellHasCandidate(x));

            if (xCells.length !== 2) {
                continue;
            }

            const wxCells = xCells.map(xId => board.getVisible(xId)
                .filter(notIn(baseUnit))
                .filter(wxId => {
                    const wx = board.cell(wxId).candidates;
                    return wx.length === 2 && wx.includes(x);
                })
            );

            for (const wx1Id of wxCells[0]) {
                const w = board.cell(wx1Id).candidates.find(notEqual(x))!;

                for (const wx2Id of wxCells[1].filter(board.cellHasCandidate(w))) {

                    const eliminations = board.getDigitEliminations(w, [wx1Id, wx2Id]);

                    if (eliminations.length > 0) {
                        const [x1Id, x2Id] = xCells;

                        return {
                            eliminations,
                            highlights: [[wx1Id, w], [wx2Id, w]],
                            highlights2: [[x1Id, x], [x2Id, x], [wx1Id, x], [wx2Id, x]],
                        };
                    }
                }
            }
        }
    }

    return undefined;
};
