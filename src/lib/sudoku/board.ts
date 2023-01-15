import { Cell, CELLS } from "./cell";
import { CellDigitPair } from "./candidate";
import { UNITS } from "./units";
import { contains, In, isSome, notIn } from "../combinatorics";
import { Digit, parseDigit } from "./digit";
import { CellData } from "./cell data";


export class Board {
    private cells: Record<Cell, CellData>;

    constructor(board?: Board) {
        const cells: Partial<Record<Cell, CellData>> = {};

        for (const id of CELLS) {
            cells[id] = new CellData(board?.cell(id));
        }

        this.cells = cells as Record<Cell, CellData>;
    }

    static fromCells(cells: Record<Cell, CellData>): Board {
        const board = new Board();

        board.cells = { ...cells };

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

    cell(id: Cell): CellData {
        return this.cells[id];
    }

    inputDigit(id: Cell, digit: Digit) {
        const cell = this.cell(id);

        if (cell.isGiven) {
            return;
        }

        cell.inputDigit(digit);
    }

    deleteDigit(id: Cell) {
        const cell = this.cell(id);

        if (cell.isGiven) {
            return;
        }

        cell.deleteDigit();
    }

    clearCell(id: Cell) {
        this.deleteDigit(id);
    }

    // helper stuff ?
    cellHasCandidate(digit: Digit): (id: Cell) => boolean {
        return id => this.cell(id).hasCandidate(digit);
    }

    getVisible(...focus: Cell[]): Cell[] {
        return UNITS
            .filter(unit => focus.some(In(unit)))
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
}
