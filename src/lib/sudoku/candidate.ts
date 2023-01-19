import { Digit } from "./digit";
import { CellId } from "./cell id";

// export type CellDigitPair = [Cell, Digit];

export type Candidate = `${CellId}${Digit}`;

export function newCandidate(cell: CellId, digit: Digit): Candidate {
    return `${cell}${digit}`;
}

export function cellOf(candidate: Candidate): CellId {
    return candidate.slice(0, 2) as CellId;
}

export function digitOf(candidate: Candidate): Digit {
    return parseInt(candidate[2]) as Digit;
}

// export function candidateToPair(candidate: Candidate): CellDigitPair {
//     return [cellOf(candidate), digitOf(candidate)];
// }
