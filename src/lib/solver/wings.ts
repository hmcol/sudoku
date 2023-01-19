import { Strategy } from ".";
import { intersection, isSubset, notEq, notIn, pairsOf, setEquality, triplesOf } from "../util/combinatorics";
import { Board, CELLS, DIGITS, UNITS, neighborsOf, newCandidate } from "../sudoku";
import { makeBasicChain } from "./chains";

export const xyWing: Strategy = {
    name: "xy-wing",
    func: makeBasicChain(["bivalue"], ["weakUnit"], 6, 6),
};

export const xyzWing: Strategy = {
    name: "xyz-wing",
    func: (board: Board) => {
        const trivalueCells = CELLS.filter(cell =>
            board.data[cell].candidates.length === 3
        );

        for (const xyzCell of trivalueCells) {
            const xyz = board.data[xyzCell].candidates;

            const bivalueNeighbors = neighborsOf(xyzCell)
                .filter(cell => board.data[cell].candidates.length === 2)
                .filter(cell => isSubset(board.data[cell].candidates, xyz));

            for (const [xzCell, yzCell] of pairsOf(bivalueNeighbors)) {
                const xz = board.data[xzCell].candidates;
                const yz = board.data[yzCell].candidates;

                if (setEquality(xz, yz)) {
                    continue;
                }

                const [z] = intersection(xz, yz);

                const eliminations = board.getDigitEliminations(z, [xyzCell, xzCell, yzCell]);

                if (eliminations.length === 0) {
                    continue;
                }

                const [x] = xz.filter(notEq(z));
                const [y] = yz.filter(notEq(z));

                const highlights = ([
                    [xyzCell, x], [xyzCell, y], [xyzCell, z],
                    [xzCell, x], [xzCell, z],
                    [yzCell, y], [yzCell, z]
                ] as const)
                    .map(([cell, digit]) => newCandidate(cell, digit));

                return {
                    eliminations,
                    highlights,
                };

            }

        }

        return undefined;
    },
};

export const wWing: Strategy = {
    name: "w-wing",
    func: (board: Board) => {
        for (const x of DIGITS) {
            for (const baseUnit of UNITS) {
                const xCells = baseUnit.filter(board.cellHasCandidate(x));

                if (xCells.length !== 2) {
                    continue;
                }

                const wxCells = xCells.map(xId => board.getVisible(xId)
                    .filter(notIn(baseUnit))
                    .filter(wxId => {
                        const wx = board.data[wxId].candidates;
                        return wx.length === 2 && wx.includes(x);
                    })
                );

                for (const wx1Id of wxCells[0]) {
                    const w = board.data[wx1Id].candidates.find(notEq(x))!;

                    for (const wx2Id of wxCells[1].filter(board.cellHasCandidate(w))) {

                        const eliminations = board.getDigitEliminations(w, [wx1Id, wx2Id]);

                        if (eliminations.length > 0) {
                            const [x1Id, x2Id] = xCells;

                            const highlights = [wx1Id, wx2Id].map(
                                cell => newCandidate(cell, w)
                            );

                            const highlights2 = [x1Id, x2Id, wx1Id, wx2Id].map(
                                cell => newCandidate(cell, x)
                            );

                            return {
                                eliminations,
                                highlights,
                                highlights2,
                            };
                        }
                    }
                }
            }
        }

        return undefined;
    },
};

export const wxyzWing: Strategy = {
    name: "wxyz-wing",
    func: (board: Board) => {
        const tetravalueCells = CELLS.filter(cell =>
            board.data[cell].candidates.length === 4
        );

        for (const wxyzCell of tetravalueCells) {
            const wxyz = board.data[wxyzCell].candidates;

            const bivalueNeighbors = neighborsOf(wxyzCell)
                .filter(cell => board.data[cell].candidates.length === 2)
                .filter(cell => board.data[cell].candidates, wxyz);

            for (const [wzCell, xzCell, yzCell] of triplesOf(bivalueNeighbors)) {
                const wz = board.data[wzCell].candidates;
                const xz = board.data[xzCell].candidates;
                const yz = board.data[yzCell].candidates;

                if (setEquality(wz, xz) || setEquality(wz, yz) || setEquality(xz, yz)) {
                    continue;
                }

                const commonDigits = wxyz.filter(z =>
                    [wz, xz, yz].every(pair => pair.includes(z))
                );

                if (commonDigits.length !== 1) {
                    continue;
                }

                const [z] = commonDigits;

                const eliminations = board.getDigitEliminations(
                    z,
                    [wxyzCell, wzCell, xzCell, yzCell]
                );

                if (eliminations.length === 0) {
                    continue;
                }

                const highlights = [wxyzCell, wzCell, xzCell, yzCell].flatMap(cell =>
                    board.data[cell].candidates
                        .filter(notEq(z))
                        .map(digit => newCandidate(cell, digit))
                );

                const highlights2 = [wxyzCell, wzCell, xzCell, yzCell]
                    .map(cell => newCandidate(cell, z));

                return {
                    eliminations,
                    highlights,
                    highlights2,
                };

            }

        }

        return undefined;
    },
};