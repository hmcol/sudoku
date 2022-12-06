export const enum Row {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F",
    G = "G",
    H = "H",
    I = "I",
}

export const enum Column {
    ONE = 1,
    TWO,
    THREE,
    FOUR,
    FIVE,
    SIX,
    SEVEN,
    EIGHT,
    NINE,
}

// export class CellId {
//     public row: Row;
//     public column: Column;

//     constructor(row: Row, column: Column) {
//         this.row = row;
//         this.column = column;
//     }
// }

export type CellId = string;



export const enum Digit {
    ONE = 1,
    TWO,
    THREE,
    FOUR,
    FIVE,
    SIX,
    SEVEN,
    EIGHT,
    NINE,
}

export const enum NoteType {
    BASIC,
    ACCENT,
    STRIKE,
}


export class CellData {
    public value: Digit | null;
    public given: boolean;
    public notes: Map<Digit, NoteType>;

    constructor(value?: Digit) {
        if (value !== undefined) {
            this.value = value;
            this.given = true;
        } else {
            this.value = null;
            this.given = false;
        }

        this.notes = new Map;
    }


}

export const Boxes = [
    ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"],
    ["A4", "A5", "A6", "B4", "B5", "B6", "C4", "C5", "C6"],
    ["A7", "A8", "A9", "B7", "B8", "B9", "C7", "C8", "C9"],
    ["D1", "D2", "D3", "E1", "E2", "E3", "F1", "F2", "F3"],
    ["D4", "D5", "D6", "E4", "E5", "E6", "F4", "F5", "F6"],
    ["D7", "D8", "D9", "E7", "E8", "E9", "F7", "F8", "F9"],
    ["G1", "G2", "G3", "H1", "H2", "H3", "I1", "I2", "I3"],
    ["G4", "G5", "G6", "H4", "H5", "H6", "I4", "I5", "I6"],
    ["G7", "G8", "G9", "H7", "H8", "H9", "I7", "I8", "I9"],
]