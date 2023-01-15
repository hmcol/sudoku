import { isSome } from "../combinatorics";
import { DIGITS, Digit } from "./digit";


export class CellData {
    digit?: Digit;
    isGiven: boolean;
    candidateSet: Set<Digit>;

    constructor(cellData?: CellData) {
        if (isSome(cellData)) {
            this.digit = cellData.digit;
            this.isGiven = cellData.isGiven;
            this.candidateSet = new Set(cellData.candidateSet);
            return;
        }

        this.isGiven = false;
        this.candidateSet = new Set(DIGITS);
    }

    static withGiven(givenDigit: Digit): CellData {
        const cellData = new CellData();

        cellData.digit = givenDigit;
        cellData.isGiven = true;
        cellData.candidateSet.clear();

        return cellData;
    }

    get candidates(): Digit[] {
        return DIGITS.filter(digit => this.hasCandidate(digit));
    }

    hasDigit(): this is { digit: Digit; } {
        return isSome(this.digit);
    }

    inputDigit(digit: Digit) {
        this.digit = digit;
        this.candidateSet.clear();
    }

    deleteDigit() {
        this.digit = undefined;
        this.candidateSet = new Set(DIGITS);
    }

    hasCandidate(digit: Digit): boolean {
        return this.candidateSet.has(digit);
    }

    eliminateCandidate(digit: Digit) {
        this.candidateSet.delete(digit);
    }
}
