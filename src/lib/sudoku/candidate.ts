import { Digit } from "./digit";
import { Cell } from "./cell";

// candidate

export type CellDigitPair = [Cell, Digit];

export type Candidate = `${Cell}${Digit}`;

export function newCandidate(cell: Cell, digit: Digit): Candidate {
    return `${cell}${digit}`;
}

export function cellOf(candidate: Candidate): Cell {
    return candidate.slice(0, 2) as Cell;
}

export function digitOf(candidate: Candidate): Digit {
    return parseInt(candidate[2]) as Digit;
}

export function candidateToPair(candidate: Candidate): CellDigitPair {
    return [cellOf(candidate), digitOf(candidate)];
}
