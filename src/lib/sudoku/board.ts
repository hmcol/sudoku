import { Cell, CELLS } from "./cell";
import { Candidate, cellOf, digitOf, newCandidate } from "./candidate";
import { UNITS } from "./units";
import { contains, isIn, isSome, notIn, setEquality } from "../combinatorics";
import { DIGITS, Digit, parseDigit } from "./digit";
import { CellData } from "./cell data";


export class Board {
    data: Record<Cell, CellData>;

    constructor(board?: Board) {
        const cells: Partial<Record<Cell, CellData>> = {};

        for (const id of CELLS) {
            cells[id] = new CellData(board?.cell(id));
        }

        this.data = cells as Record<Cell, CellData>;
    }

    static fromCells(cells: Record<Cell, CellData>): Board {
        const board = new Board();

        board.data = { ...cells };

        return board;
    }

    static fromString(boardString: string): Board | undefined {
        const str = boardString.trim();

        if (str.length < 81) {
            return undefined;
        }

        const data: Partial<Record<Cell, CellData>> = {};

        for (const [index, cell] of CELLS.entries()) {
            const digit = parseDigit(str[index]);

            data[cell] = isSome(digit) ? CellData.withGiven(digit) : new CellData();
        }

        const board = new Board();

        board.data = data as Record<Cell, CellData>;

        return board;
    }

    /**
     * @deprecated
     */
    cell(cell: Cell): CellData {
        return this.data[cell];
    }

    /**
     * @deprecated
     */
    inputDigit(cell: Cell, digit: Digit) {
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

    deleteDigit(cell: Cell) {
        const cellData = this.data[cell];

        if (cellData.isGiven) {
            return;
        }

        cellData.deleteDigit();
    }

    clearCell(cell: Cell) {
        this.deleteDigit(cell);
    }

    // helper stuff ?

    /**
     * @deprecated
     */
    cellHasCandidate(digit: Digit): (cell: Cell) => boolean {
        return cell => this.data[cell].hasCandidate(digit);
    }

    getVisible(...focus: Cell[]): Cell[] {
        return UNITS
            .filter(unit => focus.some(isIn(unit)))
            .flat()
            .filter(id => !this.cell(id).hasDigit())
            .filter(notIn(focus));
    }

    getSharedNeighbors(...foci: Cell[]): Cell[] {
        const neighbors = foci.map(id => this.getVisible(id));
        return CELLS.filter(id => neighbors.every(contains(id)));
    }

    getDigitEliminations(digit: Digit, foci: Cell[]): Candidate[] {
        return this.getSharedNeighbors(...foci)
            .filter(cell => this.data[cell].hasCandidate(digit))
            .map(cell => newCandidate(cell, digit));
    }

    isComplete(): boolean {
        return UNITS.every(unit =>
            setEquality(unit.map(cell => this.data[cell].digit), DIGITS)
        );
    }
}
