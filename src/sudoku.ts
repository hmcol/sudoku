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
    IGNORE = "ignore",
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



function canSee(x: CellId, y: CellId): boolean {
    for (const unit of UNITS) {
        if (unit.includes(x) && unit.includes(y)) {
            return true;
        }
    }

    return false;
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

    mayContain(digit?: Digit) : boolean {
        if (digit === undefined) {
            return true;
        }

        const note = this.notes.get(digit)!;

        return note !== NoteType.STRIKE && note !== NoteType.IGNORE;
    }

    restricted(digit?: Digit): boolean {
        if (digit === undefined) {
            return false;
        }

        if (this.digit !== undefined && this.digit !== digit) {
            return true;
        }

        const note = this.notes.get(digit)!;
        return note === NoteType.STRIKE || note === NoteType.IGNORE;
    }
}

export class Board {
    cells: Map<CellId, Cell>;

    constructor(board?: Board, boardString?: string) {
        if (board !== undefined) {
            this.cells = new Map(board.cells);
            return
        }

        const cells = new Map;

        CELLS.forEach((id, index) =>
            cells.set(id, new Cell(parseDigit(boardString?.charAt(index))))
        );

        this.cells = cells;
    }

    reviseNotes() {
        for (const id of CELLS) {
            const digit = this.cells.get(id)?.digit;

            if (digit === undefined) {
                continue;
            }

            for (const unit of UNITS) {
                if (unit.includes(id)) {
                    for (const otherId of unit) {
                        this.cells.get(otherId)?.notes.set(digit, NoteType.IGNORE);
                    }
                }
            }
        }
    }

    


    inputDigit(id: CellId, digit: Digit) {
        const cell = this.cells.get(id)!;

        if (cell.given) {
            return;
        }

        cell.digit = digit;
        cell.notes.clear();
    }

    deleteDigit(id: CellId) {
        const cell = this.cells.get(id);

        if (cell === undefined || cell.given) {
            return;
        }

        cell.digit = undefined;
    }

    inputNote(id: CellId, digit: Digit, note: NoteType) {
        this.cells.get(id)?.notes.set(digit, note);
    }

    deleteNote(id: CellId, digit: Digit) {
        this.cells.get(id)?.notes.delete(digit);
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
}
