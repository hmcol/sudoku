import { contains, Graph, hasSubset, In, intersection, isSubset, notEqual, notIn, pairsOf, Tuple, tuplesOf } from "./combinatorics";

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function parseDigit(str?: string): Digit | undefined {
    if (str === undefined) {
        return;
    }

    const num = parseInt(str);

    if (isNaN(num)) {
        return;
    }

    if (![1, 2, 3, 4, 5, 6, 7, 8, 9].includes(num)) {
        return;
    }

    return num as Digit;
}


export type RowId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";
export type ColumnId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CellId = `${RowId}${ColumnId}`;

export const CELLS: CellId[] = [
    "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9",
    "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9",
    "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9",
    "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9",
    "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9",
    "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9",
    "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9",
    "H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9",
    "I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8", "I9",
];

export const BOXES: CellId[][] = [
    ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"],
    ["A4", "A5", "A6", "B4", "B5", "B6", "C4", "C5", "C6"],
    ["A7", "A8", "A9", "B7", "B8", "B9", "C7", "C8", "C9"],
    ["D1", "D2", "D3", "E1", "E2", "E3", "F1", "F2", "F3"],
    ["D4", "D5", "D6", "E4", "E5", "E6", "F4", "F5", "F6"],
    ["D7", "D8", "D9", "E7", "E8", "E9", "F7", "F8", "F9"],
    ["G1", "G2", "G3", "H1", "H2", "H3", "I1", "I2", "I3"],
    ["G4", "G5", "G6", "H4", "H5", "H6", "I4", "I5", "I6"],
    ["G7", "G8", "G9", "H7", "H8", "H9", "I7", "I8", "I9"],
];

export const ROWS: CellId[][] = [
    ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9"],
    ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"],
    ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9"],
    ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9"],
    ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9"],
    ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9"],
    ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9"],
    ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9"],
    ["I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8", "I9"],
];

export const COLUMNS: CellId[][] = [
    ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1", "I1"],
    ["A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2", "I2"],
    ["A3", "B3", "C3", "D3", "E3", "F3", "G3", "H3", "I3"],
    ["A4", "B4", "C4", "D4", "E4", "F4", "G4", "H4", "I4"],
    ["A5", "B5", "C5", "D5", "E5", "F5", "G5", "H5", "I5"],
    ["A6", "B6", "C6", "D6", "E6", "F6", "G6", "H6", "I6"],
    ["A7", "B7", "C7", "D7", "E7", "F7", "G7", "H7", "I7"],
    ["A8", "B8", "C8", "D8", "E8", "F8", "G8", "H8", "I8"],
    ["A9", "B9", "C9", "D9", "E9", "F9", "G9", "H9", "I9"],
];

export const UNITS: CellId[][] = BOXES.concat(ROWS).concat(COLUMNS);
export const LINES: CellId[][] = ROWS.concat(COLUMNS);




export class Cell {
    digit?: Digit;
    given: boolean;
    candidateSet: Set<Digit>;

    constructor(givenDigit?: Digit) {
        if (givenDigit !== undefined) {
            this.digit = givenDigit;
            this.given = true;
            this.candidateSet = new Set();
        } else {
            this.given = false;
            this.candidateSet = new Set(DIGITS);
        }
    }

    get candidates(): Digit[] {
        return DIGITS.filter(digit => this.hasCandidate(digit));
    }

    hasDigit(): boolean {
        return this.digit !== undefined;
    }

    inputDigit(digit: Digit) {
        this.digit = digit;
        this.candidateSet.clear();
    }

    hasCandidate(digit: Digit): boolean {
        return this.candidateSet.has(digit);
    }

    eliminateCandidate(digit: Digit) {
        this.candidateSet.delete(digit);
    }
}

export class Board {
    cells: Record<CellId, Cell>;

    constructor(board?: Board, boardString?: string) {
        if (board !== undefined) {
            this.cells = Object.assign({}, board.cells);
            return;
        }

        const cells: Partial<Record<CellId, Cell>> = {};

        for (const [index, id] of CELLS.entries()) {
            cells[id] = new Cell(parseDigit(boardString?.charAt(index)));
        }

        this.cells = cells as Record<CellId, Cell>;

    }

    cell(id: CellId): Cell {
        return this.cells[id];
    }

    inputDigit(id: CellId, digit: Digit) {
        const cell = this.cell(id);

        if (cell.given) {
            return;
        }

        cell.inputDigit(digit);
    }

    deleteDigit(id: CellId) {
        const cell = this.cell(id);

        if (cell.given) {
            return;
        }

        cell.digit = undefined;
    }

    clearCell(id: CellId) {
        this.deleteDigit(id);
    }

    // helper stuff ?

    getVisible(...focus: CellId[]): CellId[] {
        return UNITS
            .filter(unit => focus.some(In(unit)))
            .flat()
            .filter(id => !this.cell(id).hasDigit())
            .filter(notIn(focus));
    }
}

export type StrategyResult = {
    solutions?: Array<[CellId, Digit]>,
    eliminations?: Array<[CellId, Digit]>,
    highlights?: Array<[CellId, Digit]>,
};

export type StrategyFunction = (board: Board) => StrategyResult | undefined;

export const reviseNotes: StrategyFunction = (board: Board) => {
    const eliminations = new Array<[CellId, Digit]>();

    for (const id of CELLS) {
        const cell = board.cell(id);

        if (cell.hasDigit()) {
            continue;
        }

        for (const id2 of UNITS.filter(contains(id)).flat()) {
            const digit = board.cell(id2).digit;

            if (digit !== undefined && cell.hasCandidate(digit)) {
                eliminations.push([id, digit!]);
            }
        }
    }

    return eliminations.length > 0
        ? { eliminations }
        : undefined;
};

export const hiddenSingles: StrategyFunction = (board: Board) => {
    const solutions = new Array<[CellId, Digit]>();

    for (const digit of DIGITS) {
        for (const unit of UNITS) {
            const candidateCells = unit.filter((id) =>
                board.cell(id).hasCandidate(digit)
            );

            if (candidateCells.length === 1) {
                solutions.push([candidateCells[0], digit]);
            }
        }
    }

    return solutions.length > 0
        ? { solutions }
        : undefined;
};

export const nakedSingles: StrategyFunction = (board: Board) => {
    const solutions = new Array<[CellId, Digit]>();

    for (const id of CELLS) {
        const candidates = board.cell(id).candidates;

        if (candidates.length === 1) {
            solutions.push([id, candidates[0]]);
        }
    }

    return solutions.length > 0
        ? { solutions }
        : undefined;
};

function makeNakedSubset(n: 2 | 3 | 4): StrategyFunction {
    return (board: Board) => {
        for (const unit of UNITS) {
            const unitFiltered = unit.filter(id => !board.cell(id).hasDigit());

            for (const cells of tuplesOf(n, unitFiltered)) {
                const candidates = DIGITS.filter((digit) =>
                    cells.some((id) => board.cell(id).hasCandidate(digit))
                );

                if (candidates.length !== n) {
                    continue;
                }

                const eliminations = UNITS
                    .filter(unit => isSubset(cells, unit))
                    .flat()
                    .filter(notIn(cells))
                    .map(id =>
                        candidates.filter(digit => board.cell(id).hasCandidate(digit))
                            .map(digit => [id, digit] as [CellId, Digit])
                    )
                    .flat();

                if (eliminations.length > 0) {
                    return {
                        eliminations,
                        highlights: cells.map(id => candidates.map(digit => [id, digit] as [CellId, Digit])).flat(),
                    };
                }
            }
        }

        return undefined;
    };
}

export const nakedPair = makeNakedSubset(2);
export const nakedTriple = makeNakedSubset(3);
export const nakedQuad = makeNakedSubset(4);

function makeHiddenSubset(n: 2 | 3 | 4): StrategyFunction {
    return (board: Board) => {
        for (const unit of UNITS) {
            const digits = DIGITS.filter((digit) =>
                unit.every((id) =>
                    board.cell(id).digit !== digit
                )
            );

            for (const candidates of tuplesOf(n, digits)) {
                const candidateCells = unit.filter((id) =>
                    candidates.some((digit) =>
                        board.cell(id).hasCandidate(digit)
                    )
                );

                if (candidateCells.length !== n) {
                    continue;
                }

                const eliminations = candidateCells.map(id =>
                    DIGITS.filter(notIn(candidates))
                        .filter(digit => board.cell(id).hasCandidate(digit))
                        .map(digit => [id, digit] as [CellId, Digit])
                ).flat();

                if (eliminations.length > 0) {
                    return {
                        eliminations,
                        highlights: candidateCells.map(id => candidates.map(digit => [id, digit] as [CellId, Digit])).flat(),
                    };
                }
            }
        }

        return undefined;
    };
}

export const hiddenPair = makeHiddenSubset(2);
export const hiddenTriple = makeHiddenSubset(3);
export const hiddenQuad = makeHiddenSubset(4);

function makeIntersection(baseType: CellId[][], coverType: CellId[][]): StrategyFunction {
    return (board: Board) => {
        for (const digit of DIGITS) {
            for (const baseUnit of baseType) {
                const candidateCells = baseUnit.filter((id) =>
                    board.cell(id).hasCandidate(digit)
                );

                if (candidateCells.length < 2) {
                    continue;
                }

                const coverUnit = coverType.find(hasSubset(candidateCells));

                if (coverUnit === undefined) {
                    continue;
                }

                const targets = coverUnit
                    .filter(notIn(candidateCells))
                    .filter(id => board.cell(id).hasCandidate(digit));

                if (targets.length > 0) {
                    return {
                        eliminations: targets.map(id => [id, digit] as [CellId, Digit]),
                        highlights: candidateCells.map(id => [id, digit] as [CellId, Digit]),
                    };
                }
            }
        }

        return undefined;
    };
}

export const intersectionPointing = makeIntersection(BOXES, LINES);
export const intersectionClaiming = makeIntersection(LINES, BOXES);

function makeBasicFish(n: 2 | 3 | 4): StrategyFunction {
    return (board: Board) => {
        for (const digit of DIGITS) {
            for (const [baseType, coverType] of [[COLUMNS, ROWS], [ROWS, COLUMNS]]) {
                const baseTypeFiltered = baseType.filter(unit =>
                    unit.some(id => board.cell(id).hasCandidate(digit))
                );

                for (const baseUnits of tuplesOf(n, baseTypeFiltered)) {
                    const candidateCells = baseUnits.flat().filter((id) =>
                        board.cell(id).hasCandidate(digit)
                    );

                    for (const coverUnits of tuplesOf(n, coverType)) {
                        if (!isSubset(candidateCells, coverUnits.flat())) {
                            continue;
                        }

                        const targets = coverUnits
                            .flat()
                            .filter(notIn(candidateCells))
                            .filter(id => board.cell(id).hasCandidate(digit));

                        if (targets.length > 0) {
                            return {
                                eliminations: targets.map(id => [id, digit] as [CellId, Digit]),
                                highlights: candidateCells.map(id => [id, digit] as [CellId, Digit]),
                            };
                        }
                    }
                }
            }
        }

        return undefined;
    };
}

const xWing = makeBasicFish(2);
const swordfish = makeBasicFish(3);
const jellyfish = makeBasicFish(4);


export const yWing: StrategyFunction = (board: Board) => {
    const biValuePairs = new Array<[Digit, CellId, Digit, CellId, Digit]>();

    for (const unit of UNITS) {
        const bivalueCells = unit.filter(id =>
            board.cell(id).candidates.length === 2
        );

        for (const [left, right] of pairsOf(bivalueCells)) {
            const leftCandidates = board.cell(left).candidates;
            const rightCandidates = board.cell(right).candidates;

            const sharedCandidates = leftCandidates.filter(In(rightCandidates));

            if (sharedCandidates.length !== 1) {
                continue;
            }

            const linkDigit = sharedCandidates[0];

            const leftDigit = leftCandidates.filter(notEqual(linkDigit))[0];
            const rightDigit = rightCandidates.filter(notEqual(linkDigit))[0];

            biValuePairs.push([leftDigit, left, linkDigit, right, rightDigit]);
            biValuePairs.push([rightDigit, right, linkDigit, left, leftDigit]);
        }
    }

    for (const [[z, xzId, x, xyId, y], [x2, xyId2, y2, yzId, z2]] of pairsOf(biValuePairs)) {
        if (!(x === x2 && xyId === xyId2 && y === y2 && z === z2)) {
            continue;
        }

        const targets = intersection(board.getVisible(xzId), board.getVisible(yzId))
            .filter(id => board.cell(id).hasCandidate(z));

        if (targets.length > 0) {
            return {
                eliminations: targets.map(id => [id, z] as [CellId, Digit]),
                highlights: [[xzId, x], [xzId, z], [xyId, x], [xyId, y], [yzId, y], [yzId, z]],
            };
        }
    }

    return undefined;
};

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

            const targets = intersection(board.getVisible(xyzId), intersection(board.getVisible(xzId), board.getVisible(yzId)))
                .filter(id => board.cell(id).hasCandidate(z));

            if (targets.length > 0) {
                const x = xz.filter(notEqual(z))[0];
                const y = yz.filter(notEqual(z))[0];

                return {
                    eliminations: targets.map(id => [id, z] as [CellId, Digit]),
                    highlights: [[xyzId, x], [xyzId, y], [xyzId, z], [xzId, x], [xzId, z], [yzId, y], [yzId, z]],
                };
            }
        }

    }

    return undefined;
};

export const simpleColoring: StrategyFunction = (board: Board) => {

    for (const digit of DIGITS) {
        const g = new Graph<CellId>();

        // construct graph/components
        for (const unit of UNITS) {
            const candidateCells = unit.filter((id) =>
                board.cell(id).hasCandidate(digit)
            );

            if (candidateCells.length !== 2) {
                continue;
            }

            g.addEdge(candidateCells[0], candidateCells[1]);
        }

        for (const component of g.components) {
            // color cells

            const colors = new Map<CellId, 0 | 1>();
            const stack: [CellId, 0 | 1][] = [[component[0], 0]];

            while (stack.length > 0) {
                const [u, color] = stack.pop()!;

                if (colors.has(u)) {
                    continue;
                }

                colors.set(u, color);

                const oppositeColor = color == 0 ? 1 : 0;

                for (const v of g.getNeighbors(u)!) {
                    stack.push([v, oppositeColor]);
                }
            }

            // check for color twice in a unit
            for (const unit of UNITS) {
                for (const color of [0, 1]) {
                    const count = unit.filter(c => colors.get(c) === color).length;

                    if (count <= 1) {
                        continue;
                    }

                    const solutions = component.filter(id => colors.get(id) === (1 - color)).map(id => [id, digit] as [CellId, Digit]);
                    const eliminations = component.filter(id => colors.get(id) === color).map(id => [id, digit] as [CellId, Digit]);

                    return {
                        solutions,
                        eliminations,
                    };
                }
            }

            // check for cells seeing two colors
            const colorTargets = [0, 1].map(color =>
                UNITS.filter(unit => unit.some(id => colors.get(id) === color))
                    .flat()
                    .filter(id => !colors.has(id))
                    .filter(id => board.cell(id).hasCandidate(digit))
            );

            const targets = intersection(colorTargets[0], colorTargets[1]);

            if (targets.length > 0) {
                return {
                    eliminations: targets.map(id => [id, digit])
                };
            }
        }
    }

    return undefined;
};


export type Strategy = [name: string, func: StrategyFunction];

export const STRATEGIES: Strategy[] = [
    ["revise notes", reviseNotes],
    ["naked singles", nakedSingles],
    ["hidden singles", hiddenSingles],
    ["naked pair", nakedPair],
    ["hidden pair", hiddenPair],
    ["naked triple", nakedTriple],
    ["hidden triple", hiddenTriple],
    ["intersection pointing", intersectionPointing],
    ["intersection claiming", intersectionClaiming],
    ["naked quad", nakedQuad],
    ["hidden quad", hiddenQuad],
    ["x-wing", xWing],
    ["swordfish", swordfish],
    ["jellyfish", jellyfish],
    ["simple coloring", simpleColoring],
    ["y-wing", yWing],
    ["xyz-wing", xyzWing],
];