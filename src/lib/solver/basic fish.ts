import { Strategy } from ".";
import { isNone, isSubset, notIn, tuplesOf } from "../combinatorics";
import { Board, DIGITS, COLUMNS, ROWS, newCandidate } from "../sudoku";

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
        for (const digit of DIGITS) {
            for (const [baseType, coverType] of [[COLUMNS, ROWS], [ROWS, COLUMNS]]) {
                const baseTypeFiltered = baseType.filter(unit =>
                    unit.some(board.cellHasCandidate(digit))
                );

                for (const baseUnits of tuplesOf(n, baseTypeFiltered)) {
                    const candidateCells = baseUnits.flat().filter(board.cellHasCandidate(digit));

                    const coverUnits = tuplesOf(n, coverType).find(units =>
                        isSubset(candidateCells, units.flat())
                    );

                    if (isNone(coverUnits)) {
                        continue;
                    }

                    const eliminations = coverUnits
                        .flat()
                        .filter(notIn(candidateCells))
                        .filter(board.cellHasCandidate(digit))
                        .map(cell => newCandidate(cell, digit));

                    if (eliminations.length === 0) {
                        continue;
                    }

                    return {
                        eliminations,
                        highlights: candidateCells.map(cell => newCandidate(cell, digit)),
                    };
                }
            }
        }

        return undefined;
    };
}
