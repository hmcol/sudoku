import { Strategy } from ".";
import { intersection, isSubset, notEq, notIn, pairsOf, setEquality, triplesOf } from "../util/combinatorics";
import { Board, DIGITS, newCandidate } from "../sudoku";
import { makeBasicChain } from "./chains";

export const xyWing: Strategy = {
    name: "xy-wing",
    func: makeBasicChain(["bivalue"], ["weakUnit"], 6, 6),
};

export const xyzWing: Strategy = {
    name: "xyz-wing",
    func: (board: Board) => {
        const trivalueCells = board.cells.filter(cell =>
            cell.numberOfCandidates === 3
        );

        for (const xyzCell of trivalueCells) {
            const xyz = xyzCell.candidates;

            const bivalueNeighbors = board.getNeighbors(xyzCell)
                .filter(cell => cell.numberOfCandidates === 2)
                .filter(cell => isSubset(cell.candidates, xyz));

            for (const [xzCell, yzCell] of pairsOf(bivalueNeighbors)) {
                const xz = xzCell.candidates;
                const yz = yzCell.candidates;

                if (setEquality(xz, yz)) {
                    continue;
                }

                const [z] = intersection(xz, yz);

                const eliminations = board.getDigitEliminations(z, [xyzCell.id, xzCell.id, yzCell.id]);

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
                    .map(([cell, digit]) => newCandidate(cell.id, digit));

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
            for (const baseUnit of board.units) {
                const xCells = baseUnit.filter(cell => cell.hasCandidate(x));

                if (xCells.length !== 2) {
                    continue;
                }

                const wxCells = xCells.map(xCell => board.getNeighbors(xCell)
                    .filter(notIn(baseUnit))
                    .filter(wxCell =>
                        wxCell.numberOfCandidates === 2
                        && wxCell.hasCandidate(x)
                    )
                );

                for (const wxCell1 of wxCells[0]) {
                    const w = wxCell1.candidates.find(notEq(x))!;

                    for (const wxCell2 of wxCells[1].filter(cell => cell.hasCandidate(w))) {

                        const eliminations = board.getDigitEliminations(w, [wxCell1.id, wxCell2.id]);

                        if (eliminations.length === 0) {
                            continue;
                        }

                        const [x1Id, x2Id] = xCells;

                        const highlights = [wxCell1, wxCell2].map(
                            cell => newCandidate(cell.id, w)
                        );

                        const highlights2 = [x1Id, x2Id, wxCell1, wxCell2].map(
                            cell => newCandidate(cell.id, x)
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

        return undefined;
    },
};

export const wxyzWing: Strategy = {
    name: "wxyz-wing",
    func: (board: Board) => {
        const tetravalueCells = board.cells.filter(cell =>
            cell.numberOfCandidates === 4
        );

        for (const wxyzCell of tetravalueCells) {
            const wxyz = wxyzCell.candidates;

            const bivalueNeighbors = board.getNeighbors(wxyzCell)
                .filter(cell => cell.candidates.length === 2)
                .filter(cell => isSubset(cell.candidates, wxyz));

            for (const [wzCell, xzCell, yzCell] of triplesOf(bivalueNeighbors)) {
                const wz = wzCell.candidates;
                const xz = xzCell.candidates;
                const yz = yzCell.candidates;

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
                    [wxyzCell.id, wzCell.id, xzCell.id, yzCell.id]
                );

                if (eliminations.length === 0) {
                    continue;
                }

                const highlights = [wxyzCell, wzCell, xzCell, yzCell].flatMap(cell =>
                    cell.candidates
                        .filter(notEq(z))
                        .map(digit => newCandidate(cell.id, digit))
                );

                const highlights2 = [wxyzCell, wzCell, xzCell, yzCell]
                    .map(cell => newCandidate(cell.id, z));

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