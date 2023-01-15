import { isSome } from "../combinatorics";
import { DIGITS, Digit } from "./digit";


export class CellData {
    digit?: Digit;
    isGiven: boolean;
    candidateSet: Set<Digit>;

    constructor(cell?: CellData) {
        if (isSome(cell)) {
            this.digit = cell.digit;
            this.isGiven = cell.isGiven;
            this.candidateSet = new Set(cell.candidateSet);
            return;
        }

        this.isGiven = false;
        this.candidateSet = new Set(DIGITS);
    }

    static withGiven(givenDigit: Digit): CellData {
        const cell = new CellData();

        cell.digit = givenDigit;
        cell.isGiven = true;
        cell.candidateSet.clear();

        return cell;
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
