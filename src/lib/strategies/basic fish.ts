import { Strategy } from ".";
import { isSubset, notIn, tuplesOf } from "../util/combinatorics";
import { isNone } from "../util/option";
import { Board, DIGITS, newCandidate, Cell, UnitType } from "../sudoku";

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

const unitTypePairs: [UnitType, UnitType][] = [
    ["columns", "rows"],
    ["rows", "columns"],
];

function makeBasicFish(n: 2 | 3 | 4) {
    return (board: Board) => {
        for (const x of DIGITS) {
            // filter for iterator of cells that have x as a candidate
            const hasX = (cell: Cell) => cell.hasCandidate(x);

            for (const [baseType, coverType] of unitTypePairs) {
                const baseTypeFiltered = board.iter(baseType).filter((unit) => unit.some(hasX));

                for (const baseUnits of tuplesOf(n, baseTypeFiltered)) {
                    const baseCells = baseUnits.flat().filter(hasX);

                    const coverUnits = tuplesOf(n, board.iter(coverType)).find((units) =>
                        isSubset(baseCells, units.flat())
                    );

                    if (isNone(coverUnits)) {
                        continue;
                    }

                    const coverMinusBaseCells = coverUnits
                        .flat()
                        .filter(hasX)
                        .filter(notIn(baseCells));

                    if (coverMinusBaseCells.length === 0) {
                        continue;
                    }

                    return {
                        eliminations: coverMinusBaseCells.map((cell) => newCandidate(cell.id, x)),
                        highlights: baseCells.map((cell) => newCandidate(cell.id, x)),
                    };
                }
            }
        }

        return undefined;
    };
}
