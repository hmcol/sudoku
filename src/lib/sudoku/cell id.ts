import { iterProduct, notEq, notIn } from "../util/combinatorics";
import { RowId, ColumnId, COLUMN_IDS, ROW_IDS, BOXES } from "./units";


export type CellId = `${RowId}${ColumnId}`;

export function newCell(row: RowId, column: ColumnId): CellId {
    return `${row}${column}` as CellId;
}

export function rowIdOf(cell: CellId): RowId {
    return cell[0] as RowId;
}

export function rowOf(cell: CellId): CellId[] {
    return COLUMN_IDS.map(column => newCell(rowIdOf(cell), column));
}

export function columnIdOf(cell: CellId): ColumnId {
    return parseInt(cell[1]) as ColumnId;
}

export function columnOf(cell: CellId): CellId[] {
    return ROW_IDS.map(row => newCell(row, columnIdOf(cell)));
}

export function boxOf(cell: CellId): CellId[] {
    // every cell has a box, so this is safe
    return BOXES.find(box => box.includes(cell))!;
}

export const CELLS: CellId[] = iterProduct(ROW_IDS, COLUMN_IDS).map(pair => newCell(...pair));


export function neighborsOf(cell: CellId): CellId[] {
    const box = boxOf(cell);

    return box.filter(notEq(cell))
        .concat(rowOf(cell).filter(notIn(box)))
        .concat(columnOf(cell).filter(notIn(box)));
}