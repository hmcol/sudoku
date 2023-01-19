import { Strategy } from ".";
import { isSubset, notIn, tuplesOf } from "../util/combinatorics";
import { isNone } from "../util/option";
import { Board, DIGITS, COLUMNS, ROWS, newCandidate, Cell } from "../sudoku";

export const xWing: Strategy = {
    name: "x-wing",
    func: makeBasicFish(2),
};

export const swordfish: Strategy = {
    name: "swordfish",
    func: makeBasicFish(3),
};

export const jellyfish: Strategy = {
    name: "jellyfish",
    func: makeBasicFish(4),
};

function makeBasicFish(n: 2 | 3 | 4) {
    return (board: Board) => {
        for (const x of DIGITS) {
            // filter for iterator of cells that have x as a candidate
            const hasX = (cell: Cell) => board.data[cell].hasCandidate(x);

            for (const [baseType, coverType] of [[COLUMNS, ROWS], [ROWS, COLUMNS]]) {
                const baseTypeFiltered = baseType.filter(unit => unit.some(hasX));

                for (const baseUnits of tuplesOf(n, baseTypeFiltered)) {
                    const baseCells = baseUnits.flat().filter(hasX);

                    const coverUnits = tuplesOf(n, coverType).find(units =>
                        isSubset(baseCells, units.flat())
                    );

                    if (isNone(coverUnits)) {
                        continue;
                    }

                    const coverMinusBaseCells = coverUnits.flat()
                        .filter(hasX)
                        .filter(notIn(baseCells));

                    if (coverMinusBaseCells.length === 0) {
                        continue;
                    }

                    return {
                        eliminations: coverMinusBaseCells.map(cell => newCandidate(cell, x)),
                        highlights: baseCells.map(cell => newCandidate(cell, x)),
                    };
                }
            }
        }

        return undefined;
    };
}
