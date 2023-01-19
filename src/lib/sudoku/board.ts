import { CellId, CELLS, neighborsOf } from "./cell id";
import { Candidate, cellOf, digitOf, newCandidate } from "./candidate";
import { BOXES, COLUMNS, ROWS, UNITS, UnitType } from "./units";
import { contains, isIn, notIn, setEquality } from "../util/combinatorics";
import { Option, isSome } from "../util/option";
import { DIGITS, Digit, parseDigit } from "./digit";
import { Cell } from "./cell";
import { LinkCache } from "../solver/links";


export class Board {
    cells: Record<CellId, Cell>;
    links: LinkCache;

    constructor() {
        const cells: Partial<Record<CellId, Cell>> = {};

        for (const id of CELLS) {
            cells[id] = new Cell(id);
        }

        this.cells = cells as Record<CellId, Cell>;

        this.links = new LinkCache(this);
    }

    static fromCells(cells: Record<CellId, Cell>): Board {
        const board = new Board();

        board.cells = { ...cells };

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

        board.cells = data as Record<CellId, Cell>;

        return board;
    }

    clone(): Board {
        const board = new Board();

        for (const cell of this.iterCells()) {
            board.cells[cell.id] = cell.clone();
        }

        return board;
    }

    /**
     * @deprecated
     */
    inputDigit(cell: CellId, digit: Digit) {
        const cellData = this.cells[cell];

        if (cellData.isGiven) {
            return;
        }

        cellData.setDigit(digit);
    }

    hasCandidate(candidate: Candidate): boolean {
        return this.cells[cellOf(candidate)].hasCandidate(digitOf(candidate));
    }

    fixCandidate(candidate: Candidate) {
        this.cells[cellOf(candidate)].setDigit(digitOf(candidate));
    }

    eliminateCandidate(candidate: Candidate) {
        this.cells[cellOf(candidate)].eliminateCandidate(digitOf(candidate));
    }

    deleteDigit(cell: CellId) {
        const cellData = this.cells[cell];

        if (cellData.isGiven) {
            return;
        }

        cellData.deleteDigit();
    }

    clearCell(cell: CellId) {
        this.deleteDigit(cell);
    }

    // helper stuff ?

    arePeers(cell1: CellId, cell2: CellId): boolean {
        return UNITS.some(unit =>
            unit.includes(cell1) && unit.includes(cell2)
        );
    }

    getVisible(...focus: CellId[]): CellId[] {
        return UNITS
            .filter(unit => focus.some(isIn(unit)))
            .flat()
            .filter(id => this.cells[id].isUnsolved())
            .filter(notIn(focus));
    }

    getSharedNeighbors(...foci: CellId[]): CellId[] {
        const neighbors = foci.map(id => this.getVisible(id));
        return CELLS.filter(id => neighbors.every(contains(id)));
    }

    getDigitEliminations(digit: Digit, foci: CellId[]): Candidate[] {
        return this.getSharedNeighbors(...foci)
            .filter(cell => this.cells[cell].hasCandidate(digit))
            .map(cell => newCandidate(cell, digit));
    }

    isComplete(): boolean {
        return this.iterUnits().every(unit =>
            setEquality(unit.map(cell => cell.digit), DIGITS)
        );
    }

    // new cell handling stuff

    iter(unitType: UnitType) {
        switch (unitType) {
            case "rows": return this.iterRows();
            case "columns": return this.iterColumns();
            case "lines": return this.iterLines();
            case "boxes": return this.iterBoxes();
            case "units": return this.iterUnits();
        }
    }

    iterCells() {
        return CELLS.map(id => this.cells[id]);
    }

    iterRows() {
        return ROWS.map(row => row.map(id => this.cells[id]));
    }

    iterColumns() {
        return COLUMNS.map(column => column.map(id => this.cells[id]));
    }

    iterLines() {
        return [...this.iterRows(), ...this.iterColumns()];
    }

    iterBoxes() {
        return BOXES.map(box => box.map(id => this.cells[id]));
    }

    iterUnits() {
        return UNITS.map(unit => unit.map(id => this.cells[id]));
    }

    getNeighbors(cell: Cell) {
        return neighborsOf(cell.id).map(id => this.cells[id]);
    }

    getNeighborsUnion(...cells: Cell[]) {
        const neighborhoods = cells.map(cell => this.getNeighbors(cell));
        return this.iterCells().filter(cell => neighborhoods.some(contains(cell)));
    }

    getNeighborsIntersection(...cells: Cell[]) {
        const neighborhoods = cells.map(cell => this.getNeighbors(cell));
        return this.iterCells().filter(cell => neighborhoods.every(contains(cell)));
    }
}
