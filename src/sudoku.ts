export type Row = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";
export type Column = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CellId = `${Row}${Column}`;

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];



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

export const enum NoteType {
    BASIC = "basic",
    ACCENT = "accent",
    STRIKE = "strike",
    ELIMINATED = "eliminated",
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


function pairsOf<T>(unit: T[]): [T, T][] {
    const len = unit.length;
    const pairs = new Array<[T, T]>();

    if (len < 2) {
        return [];
    }

    for (let i = 0; i < len - 1; i++) {
        for (let j = i + 1; j < len; j++) {
            pairs.push([unit[i], unit[j]]);
        }
    }

    return pairs;
}

function triplesOf<T>(arr: T[]): [T, T, T][] {
    const len = arr.length;
    const triples = new Array<[T, T, T]>();

    if (len < 3) {
        return [];
    }

    for (let i = 0; i < len - 2; i++) {
        for (let j = i + 1; j < len - 1; j++) {
            for (let k = j + 1; k < len; k++) {
                triples.push([arr[i], arr[j], arr[k]]);
            }
        }
    }

    return triples;
}

function quadsOf<T>(arr: T[]): [T, T, T, T][] {
    const len = arr.length;
    const quads = new Array<[T, T, T, T]>();

    if (len < 4) {
        return [];
    }

    for (let i = 0; i < len - 3; i++) {
        for (let j = i + 1; j < len - 2; j++) {
            for (let k = j + 1; k < len - 1; k++) {
                for (let l = k + 1; l < len; l++) {
                    quads.push([arr[i], arr[j], arr[k], arr[l]]);
                }
            }
        }
    }

    return quads;
}


function notIn<T>(arr: T[]): (item: T) => boolean {
    return (item: T) => !arr.includes(item);
}

function contains<T>(item: T): (arr: T[]) => boolean {
    return (arr: T[]) => arr.includes(item);
}

function isSubset<T>(arr1: T[], arr2: T[]): boolean {
    return arr1.every((item) => arr2.includes(item));
}




export class Cell {
    digit?: Digit;
    given: boolean;
    notes: Map<Digit, NoteType>;

    constructor(givenDigit?: Digit) {
        if (givenDigit !== undefined) {
            this.digit = givenDigit;
            this.given = true;
        } else {
            this.given = false;
        }

        this.notes = new Map;
    }

    get hasDigit(): boolean {
        return this.digit !== undefined;
    }

    get candidates(): Digit[] {
        const candidates = new Array<Digit>();

        for (const digit of DIGITS) {
            if (this.hasCandidate(digit)) {
                candidates.push(digit);
            }
        }

        return candidates;
    }

    restricts(digit?: Digit): boolean {
        if (digit === undefined) {
            return false;
        }

        if (this.digit === undefined) {
            const note = this.notes.get(digit)!;
            return note === NoteType.STRIKE || note === NoteType.ELIMINATED;
        }

        if (this.digit !== digit) {
            return true;
        }

        return false;
    }

    hasCandidate(digit: Digit): boolean {
        if (this.digit !== undefined) {
            return false;
        }

        const note = this.notes.get(digit);

        return note !== NoteType.STRIKE && note !== NoteType.ELIMINATED;
    }


}

export class Board {
    cells: Map<CellId, Cell>;

    constructor(board?: Board, boardString?: string) {
        if (board !== undefined) {
            this.cells = new Map(board.cells);
            return;
        }

        const cells = new Map;

        CELLS.forEach((id, index) =>
            cells.set(id, new Cell(parseDigit(boardString?.charAt(index))))
        );

        this.cells = cells;
    }

    cell(id: CellId): Cell {
        return this.cells.get(id)!;
    }

    inputDigit(id: CellId, digit: Digit) {
        const cell = this.cell(id);

        if (cell.given) {
            return;
        }

        cell.digit = digit;
        cell.notes.clear();
    }

    deleteDigit(id: CellId) {
        const cell = this.cell(id);

        if (cell.given) {
            return;
        }

        cell.digit = undefined;
    }

    inputNote(id: CellId, digit: Digit, note: NoteType) {
        this.cell(id).notes.set(digit, note);
    }

    deleteNote(id: CellId, digit: Digit) {
        this.cell(id).notes.delete(digit);
    }

    deleteAllNotes(id: CellId) {
        for (const digit of DIGITS) {
            this.deleteNote(id, digit);
        }
    }

    clearCell(id: CellId) {
        this.deleteDigit(id);
        this.deleteAllNotes(id);
    }

    initializeNotes() {
        const notes = new Map<Digit, NoteType>(
            DIGITS.map((digit) => [digit, NoteType.BASIC])
        );

        for (const cell of CELLS.map(this.cell)) {
            if (cell.hasDigit) {
                continue;
            }

            cell.notes = new Map(notes);
        }
    }
}

export type StrategyResult = {
    applies: boolean,
    solutions?: Array<[CellId, Digit]>,
    eliminations?: Array<[CellId, Digit]>,
};

export type Strategy = (board: Board) => StrategyResult;

export const reviseNotes: Strategy = (board: Board) => {
    const eliminations = new Array<[CellId, Digit]>();

    for (const [id, cell] of board.cells) {
        if (cell.hasDigit) {
            continue;
        }

        for (const unit of UNITS.filter(contains(id))) {
            for (const id2 of unit) {
                const digit = board.cell(id2).digit;

                if (digit !== undefined && cell.hasCandidate(digit)) {
                    eliminations.push([id, digit!]);
                }
            }
        }
    }

    return {
        applies: eliminations.length !== 0,
        eliminations: eliminations,
    };
};

export const hiddenSingles: Strategy = (board: Board) => {
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

export const nakedSingles: Strategy = (board: Board) => {
    const solutions = new Array<[CellId, Digit]>();

    for (const [id, cell] of board.cells) {
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

export const pointingPairTriple: Strategy = (board: Board) => {
    const eliminations = new Array<[CellId, Digit]>();

    for (const digit of DIGITS) {
        for (const box of BOXES) {
            const candidateCells = box.filter((id) => board.cells.get(id)!.hasCandidate(digit));

            if (candidateCells.length < 2) {
                continue;
            }

            for (const rowOrColumn of ROWS.concat(COLUMNS)) {
                if (!candidateCells.every((id) => rowOrColumn.includes(id))) {
                    continue;
                }

                const targets = rowOrColumn.filter((id) =>
                    !candidateCells.includes(id)
                    && board.cells.get(id)!.hasCandidate(digit)
                );

                if (targets.length > 0) {
                    return {
                        applies: true,
                        eliminations: targets.map((id) => [id, digit]),
                    };
                }
            }

        }
    }


    return {
        applies: false,
    };
};

export const nakedPairs: Strategy = (board: Board) => {
    const eliminations = new Array<[CellId, Digit]>();

    for (const unit of UNITS) {
        const unknowns = unit.filter((id) => !board.cell(id).hasDigit);

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

export const nakedTriples: Strategy = (board: Board) => {
    const eliminations = new Array<[CellId, Digit]>();

    for (const unit of UNITS) {
        const unknowns = unit.filter((id) => !board.cell(id).hasDigit);

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

export const nakedQuads: Strategy = (board: Board) => {
    const eliminations = new Array<[CellId, Digit]>();

    for (const unit of UNITS) {
        const unknowns = unit.filter((id) => !board.cell(id).hasDigit);

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

export const hiddenPairs: Strategy = (board: Board) => {
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

export const hiddenTriple: Strategy = (board: Board) => {
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

export const hiddenQuad: Strategy = (board: Board) => {
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

export const boxLineReduction: Strategy = (board: Board) => {

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

                const eliminations = new Array<[CellId, Digit]>();

                for (const id of box.filter(notIn(candidateCells))) {
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

    return {
        applies: false,
    };
};

export const xWing: Strategy = (board: Board) => {
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

export const STRATEGIES = [
    reviseNotes,
    hiddenSingles,
    nakedSingles,
    pointingPairTriple,
    nakedPairs,
    nakedTriples,
    nakedQuads,
    hiddenPairs,
    hiddenTriple,
    hiddenQuad,
    boxLineReduction,
    xWing,
];