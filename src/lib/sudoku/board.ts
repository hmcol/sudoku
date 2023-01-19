import { CellId, CELLS, neighborsOf } from "./cell id";
import { Candidate, cellOf, digitOf, newCandidate } from "./candidate";
import { BOXES, COLUMNS, ROWS, UNITS } from "./units";
import { contains, isIn, notIn, setEquality } from "../util/combinatorics";
import { Option, isSome } from "../util/option";
import { DIGITS, Digit, parseDigit } from "./digit";
import { Cell } from "./cell";
import { LinkCache } from "../solver/links";


export class Board {
    data: Record<CellId, Cell>;
    links: LinkCache;

    constructor() {
        const cells: Partial<Record<CellId, Cell>> = {};

        for (const id of CELLS) {
            cells[id] = new Cell(id);
        }

        this.data = cells as Record<CellId, Cell>;

        this.links = new LinkCache(this);
    }

    static fromCells(cells: Record<CellId, Cell>): Board {
        const board = new Board();

        board.data = { ...cells };

        return board;
    }

    static fromString(boardString: string): Option<Board> {
        const str = boardString.trim();

        if (str.length < 81) {
            return undefined;
        }

        const data: Partial<Record<CellId, Cell>> = {};

        for (const [index, cell] of CELLS.entries()) {
            const digit = parseDigit(str[index]);

            data[cell] = isSome(digit) ? Cell.withGiven(cell, digit) : new Cell(cell);
        }

        const board = new Board();

        board.data = data as Record<CellId, Cell>;

        return board;
    }

    clone(): Board {
        const board = new Board();

        for (const cell of this.cells) {
            board.data[cell.id] = cell.clone();
        }

        return board;
    }

    /**
     * @deprecated
     */
    cell(cell: CellId): Cell {
        return this.data[cell];
    }

    

    /**
     * @deprecated
     */
    inputDigit(cell: CellId, digit: Digit) {
        const cellData = this.data[cell];

        if (cellData.isGiven) {
            return;
        }

        cellData.setDigit(digit);
    }

    hasCandidate(candidate: Candidate): boolean {
        return this.data[cellOf(candidate)].hasCandidate(digitOf(candidate));
    }

    fixCandidate(candidate: Candidate) {
        this.data[cellOf(candidate)].setDigit(digitOf(candidate));
    }

    eliminateCandidate(candidate: Candidate) {
        this.data[cellOf(candidate)].eliminateCandidate(digitOf(candidate));
    }

    deleteDigit(cell: CellId) {
        const cellData = this.data[cell];

        if (cellData.isGiven) {
            return;
        }

        cellData.deleteDigit();
    }

    clearCell(cell: CellId) {
        this.deleteDigit(cell);
    }

    // helper stuff ?

    /**
     * @deprecated
     */
    cellHasCandidate(digit: Digit): (cell: CellId) => boolean {
        return cell => this.data[cell].hasCandidate(digit);
    }

    arePeers(cell1: CellId, cell2: CellId): boolean {
        return UNITS.some(unit => 
            unit.includes(cell1) && unit.includes(cell2)    
        );
    }

    getVisible(...focus: CellId[]): CellId[] {
        return UNITS
            .filter(unit => focus.some(isIn(unit)))
            .flat()
            .filter(id => !this.cell(id).hasDigit())
            .filter(notIn(focus));
    }

    getSharedNeighbors(...foci: CellId[]): CellId[] {
        const neighbors = foci.map(id => this.getVisible(id));
        return CELLS.filter(id => neighbors.every(contains(id)));
    }

    getDigitEliminations(digit: Digit, foci: CellId[]): Candidate[] {
        return this.getSharedNeighbors(...foci)
            .filter(cell => this.data[cell].hasCandidate(digit))
            .map(cell => newCandidate(cell, digit));
    }

    isComplete(): boolean {
        return UNITS.every(unit =>
            setEquality(unit.map(cell => this.data[cell].digit), DIGITS)
        );
    }

    // new cell handling stuff

    get cells() {
        return CELLS.map(id => this.data[id]);
    }

    get rows() {
        return ROWS.map(row => row.map(id => this.data[id]));
    }

    get columns() {
        return COLUMNS.map(column => column.map(id => this.data[id]));
    }

    get lines() {
        return [...this.rows, ...this.columns];
    }

    get boxes() {
        return BOXES.map(box => box.map(id => this.data[id]));
    }

    get units() {
        return UNITS.map(unit => unit.map(id => this.data[id]));
    }

    getNeighbors(cell: Cell) {
        return neighborsOf(cell.id).map(id => this.data[id]);
    }
}
