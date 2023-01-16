import { isSome, isSubset } from "../combinatorics";
import { DIGITS, Digit } from "./digit";


export class CellData {
    digit?: Digit;
    isGiven: boolean = false;
    private _candidates: Set<Digit> = new Set(DIGITS);

    constructor(cellData?: CellData) {
        if (isSome(cellData)) {
            this.digit = cellData.digit;
            this.isGiven = cellData.isGiven;
            this._candidates = new Set(cellData._candidates);
        }
    }

    static withGiven(givenDigit: Digit): CellData {
        const cellData = new CellData();

        cellData.digit = givenDigit;
        cellData.isGiven = true;
        cellData._candidates.clear();

        return cellData;
    }

    get candidates(): Digit[] {
        // return DIGITS.filter(digit => this.hasCandidate(digit));
        return [...this._candidates];
    }

    hasDigit(): this is { digit: Digit; } {
        return isSome(this.digit);
    }

    inputDigit(digit: Digit) {
        this.digit = digit;
        this._candidates.clear();
    }

    deleteDigit() {
        this.digit = undefined;
        this._candidates = new Set(DIGITS);
    }

    hasCandidate(digit: Digit): boolean {
        return this._candidates.has(digit);
    }

    eliminateCandidate(digit: Digit) {
        this._candidates.delete(digit);
    }

    isBivalue(): boolean {
        return this.candidates.length === 2;
    }
}
