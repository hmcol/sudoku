import { isNone, isSome } from "../util/option";
import { Cell } from "./cell";
import { DIGITS, Digit } from "./digit";


export class CellData {
    readonly id: Cell;
    digit?: Digit;
    isGiven: boolean = false;
    private candidatesInternal: Set<Digit> = new Set(DIGITS);

    constructor(id: Cell) {
        this.id = id;
    }

    static withGiven(id: Cell, givenDigit: Digit): CellData {
        const cellData = new CellData(id);

        cellData.digit = givenDigit;
        cellData.isGiven = true;
        cellData.candidatesInternal.clear();

        return cellData;
    }

    clone(): CellData {
        const data = new CellData(this.id);
        
        data.digit = this.digit;
        data.isGiven = this.isGiven;
        data.candidatesInternal = new Set(this.candidatesInternal);

        return data;
    }

    get candidates(): Digit[] {
        // return DIGITS.filter(digit => this.hasCandidate(digit));
        return [...this.candidatesInternal];
    }

    get numberOfCandidates(): number {
        return this.candidatesInternal.size;
    }

    hasDigit(): this is { digit: Digit; } {
        return isSome(this.digit);
    }

    isUnsolved(): this is { digit: undefined; } {
        return isNone(this.digit);
    }

    setDigit(digit: Digit) {
        this.digit = digit;
        this.candidatesInternal.clear();
    }

    deleteDigit() {
        this.digit = undefined;
        this.candidatesInternal = new Set(DIGITS);
    }

    hasCandidate(digit: Digit): boolean {
        return this.candidatesInternal.has(digit);
    }

    eliminateCandidate(digit: Digit) {
        this.candidatesInternal.delete(digit);
    }

    isBivalue(): boolean {
        return this.candidates.length === 2;
    }
}
