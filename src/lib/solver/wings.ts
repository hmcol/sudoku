import { Strategy } from ".";
import { intersection, isSubset, iterProduct, notEq, notIn, pairsOf, setEquality, triplesOf } from "../util/combinatorics";
import { Board, DIGITS, newCandidate } from "../sudoku";
import { makeBasicChain } from "./chains";

export const xyWing: Strategy = {
    name: "xy-wing",
    func: makeBasicChain(["bivalue"], ["weakUnit"], 6, 6),
};

export const xyzWing: Strategy = {
    name: "xyz-wing",
    func: (board: Board) => {
        const trivalueCells = board.iterCells().filter(cell =>
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

                const eliminations = board
                    .getNeighborsIntersection(xyzCell, xzCell, yzCell)
                    .filter(cell => cell.hasCandidate(z))
                    .map(cell => newCandidate(cell.id, z));

                if (eliminations.length === 0) {
                    continue;
                }
                
                const highlights = [xyzCell, xzCell, yzCell]
                    .map(cell => newCandidate(cell.id, z));

                const highlights2 = [xyzCell, xzCell, yzCell].flatMap(cell =>
                    cell.candidates
                        .filter(notEq(z))
                        .map(digit => newCandidate(cell.id, digit))
                );
                
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

export const wxyzWing: Strategy = {
    name: "wxyz-wing",
    func: (board: Board) => {
        const tetravalueCells = board.iterCells().filter(cell =>
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

                const eliminations = board
                    .getNeighborsIntersection(wxyzCell, wzCell, xzCell, yzCell)
                    .filter(cell => cell.hasCandidate(z))
                    .map(cell => newCandidate(cell.id, z));


                if (eliminations.length === 0) {
                    continue;
                }

                const highlights = [wxyzCell, wzCell, xzCell, yzCell]
                    .map(cell => newCandidate(cell.id, z));

                const highlights2 = [wxyzCell, wzCell, xzCell, yzCell].flatMap(cell =>
                    cell.candidates
                        .filter(notEq(z))
                        .map(digit => newCandidate(cell.id, digit))
                );

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

export const wWing: Strategy = {
    name: "w-wing",
    func: (board: Board) => {
        for (const x of DIGITS) {
            for (const baseUnit of board.iterUnits()) {
                const xCells = baseUnit.filter(cell => cell.hasCandidate(x));

                if (xCells.length !== 2) {
                    continue;
                }

                const [wx1Cells, wx2Cells] = xCells.map(xCell =>
                    board.getNeighbors(xCell)
                        .filter(notIn(baseUnit))
                        .filter(wxCell => wxCell.numberOfCandidates === 2)
                        .filter(wxCell => wxCell.hasCandidate(x))
                );

                const wxCellPairs = iterProduct(wx1Cells, wx2Cells)
                    .filter(([wxCell1, wxCell2]) =>
                        setEquality(wxCell1.candidates, wxCell2.candidates)
                    );

                for (const wxCells of wxCellPairs) {
                    const [w] = wxCells[0].candidates.filter(notEq(x));

                    const eliminations = board.getNeighborsIntersection(...wxCells)
                        .filter(cell => cell.hasCandidate(w))
                        .map(cell => newCandidate(cell.id, w));

                    if (eliminations.length === 0) {
                        continue;
                    }

                    const highlights = wxCells
                        .map(cell => newCandidate(cell.id, w));

                    const highlights2 = [...xCells, ...wxCells]
                        .map(cell => newCandidate(cell.id, x));

                    return {
                        eliminations,
                        highlights,
                        highlights2,
                    };
                }
            }
        }

        return undefined;
    },
};