import { contains, Graph, In, intersection, isSome, isSubset, notIn, pairsOf, quadsOf, triplesOf, UnionFindGood } from "./combinatorics";

export type Row = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";
export type Column = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CellId = `${Row}${Column}`;

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
    applies: boolean,
    solutions?: Array<[CellId, Digit]>,
    eliminations?: Array<[CellId, Digit]>,
    highlights?: Array<[CellId, Digit]>,
};

export type StrategyFunction = (board: Board) => StrategyResult;

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

    return {
        applies: eliminations.length !== 0,
        eliminations: eliminations,
    };
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

    return {
        applies: solutions.length !== 0,
        solutions: solutions,
    };
};

export const nakedSingles: StrategyFunction = (board: Board) => {
    const solutions = new Array<[CellId, Digit]>();

    for (const id of CELLS) {
        const cell = board.cell(id);
        const candidates = cell.candidates;

        if (candidates.length === 1) {
            solutions.push([id, candidates[0]]);
        }
    }

    return {
        applies: solutions.length !== 0,
        solutions: solutions,
    };
};

export const intersectionPointing: StrategyFunction = (board: Board) => {
    const eliminations = new Array<[CellId, Digit]>();
    const highlights = new Array<[CellId, Digit]>();

    for (const digit of DIGITS) {
        for (const box of BOXES) {
            const candidateCells = box.filter((id) =>
                board.cell(id).hasCandidate(digit)
            );

            if (candidateCells.length < 2) {
                continue;
            }

            for (const line of LINES) {
                if (!isSubset(candidateCells, line)) {
                    continue;
                }

                const targets = line
                    .filter(notIn(candidateCells))
                    .filter(id => board.cell(id).hasCandidate(digit));

                if (targets.length > 0) {
                    eliminations.push(...targets.map(id => [id, digit] as [CellId, Digit]))
                    highlights.push(...candidateCells.map(id => [id, digit] as [CellId, Digit]))
                }
            }
        }
    }

    return {
        applies: eliminations.length !== 0,
        eliminations,
        highlights,
    };
};

export const nakedPairs: StrategyFunction = (board: Board) => {
    const eliminations = new Array<[CellId, Digit]>();

    for (const unit of UNITS) {
        const unknowns = unit.filter((id) => !board.cell(id).hasDigit());

        for (const pair of pairsOf(unknowns)) {

            const candidates = DIGITS.filter((digit) =>
                pair.some((id) =>
                    board.cell(id).hasCandidate(digit)
                )
            );

            if (candidates.length !== 2) {
                continue;
            }

            for (const id of unit.filter(notIn(pair))) {
                for (const digit of candidates) {
                    if (board.cell(id).hasCandidate(digit)) {
                        eliminations.push([id, digit]);
                    }
                }
            }
        }
    }

    return {
        applies: eliminations.length !== 0,
        eliminations: eliminations
    };
};

export const nakedTriples: StrategyFunction = (board: Board) => {
    const eliminations = new Array<[CellId, Digit]>();

    for (const unit of UNITS) {
        const unknowns = unit.filter((id) => !board.cell(id).hasDigit());

        for (const triple of triplesOf(unknowns)) {

            const candidates = DIGITS.filter((digit) =>
                triple.some((id) =>
                    board.cell(id).hasCandidate(digit)
                )
            );

            if (candidates.length !== 3) {
                continue;
            }

            for (const id of unit.filter(notIn(triple))) {
                for (const digit of candidates) {
                    if (board.cell(id).hasCandidate(digit)) {
                        eliminations.push([id, digit]);
                    }
                }
            }
        }
    }

    return {
        applies: eliminations.length !== 0,
        eliminations: eliminations
    };
};

export const nakedQuads: StrategyFunction = (board: Board) => {
    const eliminations = new Array<[CellId, Digit]>();

    for (const unit of UNITS) {
        const unknowns = unit.filter((id) => !board.cell(id).hasDigit());

        for (const quad of quadsOf(unknowns)) {

            const candidates = DIGITS.filter((digit) =>
                quad.some((id) =>
                    board.cell(id).hasCandidate(digit)
                )
            );

            if (candidates.length !== 4) {
                continue;
            }

            for (const id of unit.filter(notIn(quad))) {
                for (const digit of candidates) {
                    if (board.cell(id).hasCandidate(digit)) {
                        eliminations.push([id, digit]);
                    }
                }
            }
        }
    }

    return {
        applies: eliminations.length !== 0,
        eliminations: eliminations
    };
};

export const hiddenPairs: StrategyFunction = (board: Board) => {
    const eliminations = new Array<[CellId, Digit]>();

    for (const unit of UNITS) {
        const digits = DIGITS.filter((digit) =>
            unit.every((id) =>
                board.cell(id).digit !== digit
            )
        );

        for (const pair of pairsOf(digits)) {

            const candidateCells = unit.filter((id) =>
                pair.some((digit) =>
                    board.cell(id).hasCandidate(digit)
                )
            );

            if (candidateCells.length !== 2) {
                continue;
            }

            for (const id of candidateCells) {
                for (const digit of DIGITS.filter(notIn(pair))) {
                    if (board.cell(id).hasCandidate(digit)) {
                        eliminations.push([id, digit]);
                    }
                }
            }
        }
    }

    return {
        applies: eliminations.length !== 0,
        eliminations: eliminations
    };
};

export const hiddenTriples: StrategyFunction = (board: Board) => {
    const eliminations = new Array<[CellId, Digit]>();

    for (const unit of UNITS) {
        const digits = DIGITS.filter((digit) =>
            unit.every((id) =>
                board.cell(id).digit !== digit
            )
        );

        for (const triple of triplesOf(digits)) {

            const candidateCells = unit.filter((id) =>
                triple.some((digit) =>
                    board.cell(id).hasCandidate(digit)
                )
            );

            if (candidateCells.length !== 3) {
                continue;
            }

            for (const id of candidateCells) {
                for (const digit of DIGITS.filter(notIn(triple))) {
                    if (board.cell(id).hasCandidate(digit)) {
                        eliminations.push([id, digit]);
                    }
                }
            }
        }
    }

    return {
        applies: eliminations.length !== 0,
        eliminations: eliminations
    };
};

export const hiddenQuads: StrategyFunction = (board: Board) => {
    const eliminations = new Array<[CellId, Digit]>();

    for (const unit of UNITS) {
        const digits = DIGITS.filter((digit) =>
            unit.every((id) =>
                board.cell(id).digit !== digit
            )
        );

        for (const quad of quadsOf(digits)) {

            const candidateCells = unit.filter((id) =>
                quad.some((digit) =>
                    board.cell(id).hasCandidate(digit)
                )
            );

            if (candidateCells.length !== 4) {
                continue;
            }

            for (const id of candidateCells) {
                for (const digit of DIGITS.filter(notIn(quad))) {
                    if (board.cell(id).hasCandidate(digit)) {
                        eliminations.push([id, digit]);
                    }
                }
            }
        }
    }

    return {
        applies: eliminations.length !== 0,
        eliminations: eliminations
    };
};

export const intersectionClaiming: StrategyFunction = (board: Board) => {
    const eliminations = new Array<[CellId, Digit]>();

    for (const digit of DIGITS) {
        const lines = LINES.filter((line) =>
            line.every((id) =>
                board.cell(id).digit !== digit
            )
        );

        for (const line of lines) {
            const candidateCells = line.filter((id) =>
                board.cell(id).hasCandidate(digit)
            );

            for (const box of BOXES) {
                if (!isSubset(candidateCells, box)) {
                    continue;
                }

                for (const id of box.filter(notIn(candidateCells))) {
                    if (board.cell(id).hasCandidate(digit)) {
                        eliminations.push([id, digit]);
                    }
                }
            }
        }
    }

    return {
        applies: eliminations.length !== 0,
        eliminations: eliminations
    };
};

export const xWing: StrategyFunction = (board: Board) => {
    for (const digit of DIGITS) {
        for (const [axis1, axis2] of [[COLUMNS, ROWS], [ROWS, COLUMNS]]) {
            const lines1 = axis1.filter((line) =>
                line.every((id) =>
                    board.cell(id).digit !== digit
                )
            );

            for (const lines1Pair of pairsOf(lines1)) {
                const candidateCells = lines1Pair.flat().filter((id) =>
                    board.cell(id).hasCandidate(digit)
                );

                for (const line2Pair of pairsOf(axis2)) {
                    if (!isSubset(candidateCells, line2Pair.flat())) {
                        continue;
                    }

                    const eliminations = new Array<[CellId, Digit]>();

                    for (const id of line2Pair.flat().filter(notIn(candidateCells))) {
                        if (board.cell(id).hasCandidate(digit)) {
                            eliminations.push([id, digit]);
                        }
                    }

                    if (eliminations.length === 0) {
                        continue;
                    }

                    return {
                        applies: true,
                        eliminations: eliminations,
                    };
                }
            }

        }
    }

    return {
        applies: false,
    };
};

export const yWing: StrategyFunction = (board: Board) => {
    const biValuePairs = new Array<[Digit, CellId, Digit, CellId, Digit]>();

    for (const unit of UNITS) {
        for (const [left, right] of pairsOf(unit)) {
            const leftCandidates = board.cell(left).candidates;
            const rightCandidates = board.cell(right).candidates;

            if (leftCandidates.length !== 2 || rightCandidates.length !== 2) {
                continue;
            }

            const shared = leftCandidates.filter(In(rightCandidates));

            if (shared.length !== 1) {
                continue;
            }

            const linkDigit = shared[0];

            const leftDigit = leftCandidates.filter(notIn(shared))[0];
            const rightDigit = rightCandidates.filter(notIn(shared))[0];

            biValuePairs.push([leftDigit, left, linkDigit, right, rightDigit]);
            biValuePairs.push([rightDigit, right, linkDigit, left, leftDigit]);

        }
    }

    for (const [pair1, pair2] of pairsOf(biValuePairs)) {
        if (!(pair1[2] == pair2[0] && pair1[3] == pair2[1] && pair1[4] == pair2[2] && pair1[0] == pair2[4])) {
            continue;
        }

        const x = pair1[2];
        const y = pair2[2];
        const z = pair1[0];


        const left = pair1[1];
        const right = pair2[3];

        const leftNeighbors = UNITS.filter(contains(left)).flat().filter((id) => id !== left);
        const rightNeighbors = UNITS.filter(contains(right)).flat().filter((id) => id !== right);

        const targets = leftNeighbors.filter(In(rightNeighbors)).filter((id) => board.cell(id).hasCandidate(z));

        // console.log(left, `[${z}${x}]`, pair1[3], `[${x}${y}]`, right, `[${y}${z}]`, targets, `-[${z}]`);

        if (targets.length > 0) {
            const eliminations = new Array<[CellId, Digit]>();

            for (const target of targets) {
                eliminations.push([target, z]);
            }

            return {
                applies: true,
                eliminations: eliminations,
            };
        }

    }

    return {
        applies: false,
    };
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


        // console.log(digit, uf.components);

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
                        applies: true,
                        solutions,
                        eliminations,
                    };
                }
            }

            // check for seeing two colors

            const colorTargets = [0, 1].map(color =>
                UNITS.filter(unit => unit.some(id => colors.get(id) === color))
                    .flat()
                    .filter(id => !colors.has(id))
                    .filter(id => board.cell(id).hasCandidate(digit))
            );

            const targets = intersection(colorTargets[0], colorTargets[1]);

            if (targets.length > 0) {
                return {
                    applies: true,
                    eliminations: targets.map(id => [id, digit])
                };
            }
        }
    }

    return {
        applies: false,
    };
};


export type Strategy = [string, StrategyFunction];

export const STRATEGIES: Strategy[] = [
    ["revise notes", reviseNotes],
    ["naked singles", nakedSingles],
    ["hidden singles", hiddenSingles],
    ["intersection pointing", intersectionPointing],
    ["naked pairs", nakedPairs],
    ["naked triples", nakedTriples],
    ["hidden pairs", hiddenPairs],
    ["hidden triples", hiddenTriples],
    ["naked quads", nakedQuads],
    ["hidden quads", hiddenQuads],
    ["intersection claiming", intersectionClaiming],
    ["x-wing", xWing],
    ["y-wing", yWing],
    ["simple coloring", simpleColoring],
];