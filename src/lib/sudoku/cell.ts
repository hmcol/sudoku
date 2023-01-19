import { iterProduct, notEq, notIn } from "../util/combinatorics";
import { RowId, ColumnId, COLUMN_IDS, ROW_IDS, BOXES } from "./units";


export type Cell = `${RowId}${ColumnId}`;

export function newCell(row: RowId, column: ColumnId): Cell {
    return `${row}${column}` as Cell;
}

export function rowIdOf(cell: Cell): RowId {
    return cell[0] as RowId;
}

export function rowOf(cell: Cell): Cell[] {
    return COLUMN_IDS.map(column => newCell(rowIdOf(cell), column));
}

export function columnIdOf(cell: Cell): ColumnId {
    return parseInt(cell[1]) as ColumnId;
}

export function columnOf(cell: Cell): Cell[] {
    return ROW_IDS.map(row => newCell(row, columnIdOf(cell)));
}

export function boxOf(cell: Cell): Cell[] {
    // every cell has a box, so this is safe
    return BOXES.find(box => box.includes(cell))!;
}

export const CELLS: Cell[] = iterProduct(ROW_IDS, COLUMN_IDS).map(pair => newCell(...pair));


export function neighborsOf(cell: Cell): Cell[] {
    const box = boxOf(cell);

    return box.filter(notEq(cell))
        .concat(rowOf(cell).filter(notIn(box)))
        .concat(columnOf(cell).filter(notIn(box)));
}