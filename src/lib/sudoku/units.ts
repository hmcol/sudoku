import { CellId, newCell } from "./cell id";

// rows

export type RowId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";
export const ROW_IDS: RowId[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

// columns

export type ColumnId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const COLUMN_IDS: ColumnId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export type UnitType = "rows" | "columns" | "lines" | "boxes" | "units";



// units

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

export const ROWS: CellId[][] = ROW_IDS.map(r => COLUMN_IDS.map(c => newCell(r, c)));
export const COLUMNS: CellId[][] = COLUMN_IDS.map(c => ROW_IDS.map(r => newCell(r, c)));

export const LINES: CellId[][] = ROWS.concat(COLUMNS);
export const UNITS: CellId[][] = BOXES.concat(LINES);

// chutes

export const FLOORS: CellId[][][] = [ROWS.slice(0, 3), ROWS.slice(3, 6), ROWS.slice(6, 9)];
export const TOWERS: CellId[][][] = [COLUMNS.slice(0, 3), COLUMNS.slice(3, 6), COLUMNS.slice(6, 9)];
export const CHUTES = FLOORS.concat(TOWERS);
