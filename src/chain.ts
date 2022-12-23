import { notEqual } from "./combinatorics";
import { Board, CELLS, CandidateId, DIGITS, Digit, StrategyResult, UNITS, cidOf } from "./sudoku";

export class CandidateLinks {
    links: Map<CandidateId, CandidateId[]>;

    constructor() {
        this.links = new Map();
    }

    get candidates() {
        return this.links.keys();
    }

    add(source: CandidateId, target: CandidateId) {
        if (this.links.get(source) === undefined) {
            this.links.set(source, []);
        }

        this.links.get(source)?.push(target);
    }

    get(source: CandidateId): CandidateId[] {
        return this.links.get(source) ?? [];
    }

    // strong link finders

    findStrongBivalue(board: Board) {
        const bivalueCells = CELLS.filter(id => board.cell(id).candidates.length === 2);
        for (const id of bivalueCells) {
            const [x, y] = board.cell(id).candidates.map(c => cidOf(id, c));

            this.add(x, y);
            this.add(y, x);
        }
    }

    findStrongBilocal(board: Board, digit: Digit) {
        for (const unit of UNITS) {
            const candidateCells = unit.filter(id =>
                board.cell(id).hasCandidate(digit)
            );

            for (const id1 of candidateCells) {
                for (const id2 of candidateCells.filter(notEqual(id1))) {
                    this.add(cidOf(id1, digit), cidOf(id2, digit));
                }
            }
        }
    }

    findStrongBilocalAll(board: Board) {
        for (const digit of DIGITS) {
            this.findStrongBilocal(board, digit);
        }
    }

    // weak link finders

    findWeakCell(board: Board) {
        for (const id of CELLS) {
            const candidates = board.cell(id).candidates;

            for (const digit1 of candidates) {
                for (const digit2 of candidates.filter(notEqual(digit1))) {
                    this.add(cidOf(id, digit1), cidOf(id, digit2));
                }
            }
        }
    }

    findWeakUnit(board: Board, digit: Digit) {
        for (const unit of UNITS) {
            const candidateCells = unit.filter((id) =>
                board.cell(id).hasCandidate(digit)
            );

            for (const id1 of candidateCells) {
                for (const id2 of candidateCells.filter(notEqual(id1))) {
                    this.add(cidOf(id1, digit), cidOf(id2, digit));
                }
            }

        }
    }

    findWeakUnitAll(board: Board) {
        for (const digit of DIGITS) {
            this.findWeakUnit(board, digit);
        }
    }
}

// function findAlternatingChain(board: Board, strongLinks: CandidateLinks, weakLinks: CandidateLinks): StrategyResult | undefined {


//     return undefined;
// }

export function backtrackChain(end: CandidateId, parents: Map<CandidateId, CandidateId>): CandidateId[] {
    const chain = [end];

    let v = end;
    while (parents.has(v)) {
        v = parents.get(v)!;
        chain.push(v);
    }

    return chain;
}