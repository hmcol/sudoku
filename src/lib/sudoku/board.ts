import { Cell, CELLS } from "./cell";
import { CellDigitPair } from "./candidate";
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

        const cells: Partial<Record<Cell, CellData>> = {};

        for (const [index, id] of CELLS.entries()) {
            const digit = parseDigit(str[index]);

            cells[id] = isSome(digit) ? CellData.withGiven(digit) : new CellData();
        }

        return Board.fromCells(cells as Record<Cell, CellData>);
    }

    /**
     * @deprecated
     */
    cell(id: Cell): CellData {
        return this.data[id];
    }

    inputDigit(cell: Cell, digit: Digit) {
        const cellData = this.data[cell];

        if (cellData.isGiven) {
            return;
        }

        cellData.inputDigit(digit);
    }

    deleteDigit(id: Cell) {
        const cell = this.data[id];

        if (cell.isGiven) {
            return;
        }

        cell.deleteDigit();
    }

    clearCell(id: Cell) {
        this.deleteDigit(id);
    }

    // helper stuff ?
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

    getDigitEliminations(digit: Digit, foci: Cell[]): CellDigitPair[] {
        return this.getSharedNeighbors(...foci)
            .filter(this.cellHasCandidate(digit))
            .map(id => [id, digit]);
    }

    isComplete(): boolean {
        return UNITS.every(unit =>
            setEquality(unit.map(cell => this.data[cell].digit), DIGITS)
        );
    }
}
