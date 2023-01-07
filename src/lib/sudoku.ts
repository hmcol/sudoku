import { makeBasicChain } from "./chain";
import { contains, hasSubset, In, intersection, isNone, isSome, isSubset, notEqual, notIn, pairsOf, tuplesOf } from "./combinatorics";

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function parseDigit(str?: string): Digit | undefined {
    if (isNone(str)) {
        return undefined;
    }

    const num = parseInt(str);

    if (isNaN(num)) {
        return undefined;
    }

    if (![1, 2, 3, 4, 5, 6, 7, 8, 9].includes(num)) {
        return undefined;
    }

    return num as Digit;
}

export type RowId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";
export type ColumnId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CellId = `${RowId}${ColumnId}`;

export type Candidate = [CellId, Digit];

export type CandidateId = `${CellId}${Digit}`;

export function cidOf(id: CellId, digit: Digit): CandidateId {
    return `${id}${digit}`;
}

export function cellIdOf(cid: CandidateId): CellId {
    return cid.slice(0, 2) as CellId;
}

export function digitOf(cid: CandidateId): Digit {
    return parseInt(cid[2]) as Digit;
}

export function cidToPair(cid: CandidateId): Candidate {
    return [cellIdOf(cid), digitOf(cid)];
}

export const CELLS: CellId[] = [
    "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9",
    "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9",
    "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9",
    "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9",
    "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9",
    "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9",
    "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9",
    "H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9",
    "I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8", "I9",
];

export const BOXES: CellId[][] = [
    ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"],
    ["A4", "A5", "A6", "B4", "B5", "B6", "C4", "C5", "C6"],
    ["A7", "A8", "A9", "B7", "B8", "B9", "C7", "C8", "C9"],
    ["D1", "D2", "D3", "E1", "E2", "E3", "F1", "F2", "F3"],
    ["D4", "D5", "D6", "E4", "E5", "E6", "F4", "F5", "F6"],
    ["D7", "D8", "D9", "E7", "E8", "E9", "F7", "F8", "F9"],
    ["G1", "G2", "G3", "H1", "H2", "H3", "I1", "I2", "I3"],
    ["G4", "G5", "G6", "H4", "H5", "H6", "I4", "I5", "I6"],
    ["G7", "G8", "G9", "H7", "H8", "H9", "I7", "I8", "I9"],
];

export const ROWS: CellId[][] = [
    ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9"],
    ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"],
    ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9"],
    ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9"],
    ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9"],
    ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9"],
    ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9"],
    ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9"],
    ["I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8", "I9"],
];

export const COLUMNS: CellId[][] = [
    ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1", "I1"],
    ["A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2", "I2"],
    ["A3", "B3", "C3", "D3", "E3", "F3", "G3", "H3", "I3"],
    ["A4", "B4", "C4", "D4", "E4", "F4", "G4", "H4", "I4"],
    ["A5", "B5", "C5", "D5", "E5", "F5", "G5", "H5", "I5"],
    ["A6", "B6", "C6", "D6", "E6", "F6", "G6", "H6", "I6"],
    ["A7", "B7", "C7", "D7", "E7", "F7", "G7", "H7", "I7"],
    ["A8", "B8", "C8", "D8", "E8", "F8", "G8", "H8", "I8"],
    ["A9", "B9", "C9", "D9", "E9", "F9", "G9", "H9", "I9"],
];

export const UNITS: CellId[][] = BOXES.concat(ROWS).concat(COLUMNS);
export const LINES: CellId[][] = ROWS.concat(COLUMNS);


export class Cell {
    digit?: Digit;
    isGiven: boolean;
    candidateSet: Set<Digit>;

    constructor(cell?: Cell) {
        if (isSome(cell)) {
            this.digit = cell.digit;
            this.isGiven = cell.isGiven;
            this.candidateSet = new Set(cell.candidateSet);
            return;
        }

        this.isGiven = false;
        this.candidateSet = new Set(DIGITS);
    }

    static withGiven(givenDigit: Digit): Cell {
        const cell = new Cell();

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


export class Board {
    private cells: Record<CellId, Cell>;

    constructor(board?: Board) {
        const cells: Partial<Record<CellId, Cell>> = {};

        for (const id of CELLS) {
            cells[id] = new Cell(board?.cell(id));
        }

        this.cells = cells as Record<CellId, Cell>;
    }

    static fromCells(cells: Record<CellId, Cell>): Board {
        const board = new Board();

        board.cells = { ...cells };

        return board;
    }

    static fromString(boardString: string): Board | undefined {
        const str = boardString.trim();

        if (str.length < 81) {
            return undefined;
        }

        const cells: Partial<Record<CellId, Cell>> = {};

        for (const [index, id] of CELLS.entries()) {
            const digit = parseDigit(str[index]);

            cells[id] = isSome(digit) ? Cell.withGiven(digit) : new Cell();
        }

        return Board.fromCells(cells as Record<CellId, Cell>);
    }

    cell(id: CellId): Cell {
        return this.cells[id];
    }

    inputDigit(id: CellId, digit: Digit) {
        const cell = this.cell(id);

        if (cell.isGiven) {
            return;
        }

        cell.inputDigit(digit);
    }

    deleteDigit(id: CellId) {
        const cell = this.cell(id);

        if (cell.isGiven) {
            return;
        }

        cell.deleteDigit();
    }

    clearCell(id: CellId) {
        this.deleteDigit(id);
    }

    // helper stuff ?

    cellHasCandidate(digit: Digit): (id: CellId) => boolean {
        return id => this.cell(id).hasCandidate(digit);
    }

    getVisible(...focus: CellId[]): CellId[] {
        return UNITS
            .filter(unit => focus.some(In(unit)))
            .flat()
            .filter(id => !this.cell(id).hasDigit())
            .filter(notIn(focus));
    }

    getSharedNeighbors(...foci: CellId[]): CellId[] {
        const neighbors = foci.map(id => this.getVisible(id));
        return CELLS.filter(id => neighbors.every(contains(id)));
    }

    getDigitEliminations(digit: Digit, foci: CellId[]): Candidate[] {
        return this.getSharedNeighbors(...foci)
            .filter(this.cellHasCandidate(digit))
            .map(id => [id, digit]);
    }




}

export type StrategyResult = {
    solutions?: Array<Candidate>,
    eliminations?: Array<Candidate>,
    highlights?: Array<Candidate>,
    highlights2?: Array<Candidate>,
};

export type StrategyFunction = (board: Board) => StrategyResult | undefined;

const reviseNotes: StrategyFunction = (board: Board) => {
    const eliminations = new Array<Candidate>();

    for (const id of CELLS) {
        const cell = board.cell(id);

        if (cell.hasDigit()) {
            continue;
        }

        for (const id2 of UNITS.filter(contains(id)).flat()) {
            const digit = board.cell(id2).digit;

            if (isSome(digit) && cell.hasCandidate(digit)) {
                eliminations.push([id, digit]);
            }
        }
    }

    return eliminations.length > 0 ?
        { eliminations } :
        undefined;
};

const fullHouse: StrategyFunction = (board: Board) => {
    const solutions = new Array<Candidate>();

    for (const unit of UNITS) {
        const unsolvedCells = unit.filter(id => !board.cell(id).hasDigit());

        if (unsolvedCells.length !== 1) {
            continue;
        }

        const id = unsolvedCells[0];
        const digit = board.cell(id).candidates[0]; // should be true if notes are correct

        solutions.push([id, digit]);
    }

    return solutions.length > 0 ?
        { solutions } :
        undefined;
};

const hiddenSingle: StrategyFunction = (board: Board) => {
    const solutions = new Array<Candidate>();

    for (const digit of DIGITS) {
        for (const unit of UNITS) {
            const candidateCells = unit.filter((id) =>
                board.cell(id).hasCandidate(digit)
            );

            if (candidateCells.length === 1) {
                solutions.push([candidateCells[0], digit]);
            }
        }
    }

    return solutions.length > 0 ?
        { solutions } :
        undefined;
};

const nakedSingle: StrategyFunction = (board: Board) => {
    const solutions = new Array<Candidate>();

    for (const id of CELLS) {
        const candidates = board.cell(id).candidates;

        if (candidates.length === 1) {
            solutions.push([id, candidates[0]]);
        }
    }

    return solutions.length > 0 ?
        { solutions } :
        undefined;
};

function makeNakedSubset(n: 2 | 3 | 4): StrategyFunction {
    return (board: Board) => {
        for (const unit of UNITS) {
            const unitFiltered = unit.filter(id => !board.cell(id).hasDigit());

            for (const cells of tuplesOf(n, unitFiltered)) {
                const candidates = DIGITS.filter(digit =>
                    cells.some(board.cellHasCandidate(digit))
                );

                if (candidates.length !== n) {
                    continue;
                }

                const eliminations = candidates.map(digit =>
                    board.getDigitEliminations(digit, cells)
                ).flat();

                if (eliminations.length > 0) {
                    return {
                        eliminations,
                        highlights: cells.map(id => candidates.map(digit => [id, digit] as Candidate)).flat(),
                    };
                }
            }
        }

        return undefined;
    };
}

const nakedPair = makeNakedSubset(2);
const nakedTriple = makeNakedSubset(3);
const nakedQuad = makeNakedSubset(4);

function makeHiddenSubset(n: 2 | 3 | 4): StrategyFunction {
    return (board: Board) => {
        for (const unit of UNITS) {
            const digits = DIGITS.filter(digit =>
                unit.every(id =>
                    board.cell(id).digit !== digit
                )
            );

            for (const candidates of tuplesOf(n, digits)) {
                const candidateCells = unit.filter(id =>
                    candidates.some(digit =>
                        board.cell(id).hasCandidate(digit)
                    )
                );

                if (candidateCells.length !== n) {
                    continue;
                }

                const eliminations = candidateCells.map(id =>
                    DIGITS.filter(notIn(candidates))
                        .filter(digit => board.cell(id).hasCandidate(digit))
                        .map(digit => [id, digit] as Candidate)
                ).flat();

                if (eliminations.length > 0) {
                    return {
                        eliminations,
                        highlights: candidateCells.map(id => candidates.map(digit => [id, digit] as Candidate)).flat(),
                    };
                }
            }
        }

        return undefined;
    };
}

const hiddenPair = makeHiddenSubset(2);
const hiddenTriple = makeHiddenSubset(3);
const hiddenQuad = makeHiddenSubset(4);


function makeIntersection(baseType: CellId[][], coverType: CellId[][]): StrategyFunction {
    return (board: Board) => {
        for (const digit of DIGITS) {
            for (const baseUnit of baseType) {
                const candidateCells = baseUnit.filter((id) =>
                    board.cell(id).hasCandidate(digit)
                );

                if (candidateCells.length < 2) {
                    continue;
                }

                const coverUnit = coverType.find(hasSubset(candidateCells));

                if (isNone(coverUnit)) {
                    continue;
                }

                const targets = coverUnit
                    .filter(notIn(candidateCells))
                    .filter(id => board.cell(id).hasCandidate(digit));

                if (targets.length > 0) {
                    return {
                        eliminations: targets.map(id => [id, digit] as Candidate),
                        highlights: candidateCells.map(id => [id, digit] as Candidate),
                    };
                }
            }
        }

        return undefined;
    };
}

const intersectionPointing = makeIntersection(BOXES, LINES);
const intersectionClaiming = makeIntersection(LINES, BOXES);

function makeBasicFish(n: 2 | 3 | 4): StrategyFunction {
    return (board: Board) => {
        for (const digit of DIGITS) {
            for (const [baseType, coverType] of [[COLUMNS, ROWS], [ROWS, COLUMNS]]) {
                const baseTypeFiltered = baseType.filter(unit =>
                    unit.some(board.cellHasCandidate(digit))
                );

                for (const baseUnits of tuplesOf(n, baseTypeFiltered)) {
                    const candidateCells = baseUnits.flat().filter(board.cellHasCandidate(digit));

                    for (const coverUnits of tuplesOf(n, coverType)) {
                        if (!isSubset(candidateCells, coverUnits.flat())) {
                            continue;
                        }

                        const targets = coverUnits
                            .flat()
                            .filter(notIn(candidateCells))
                            .filter(board.cellHasCandidate(digit));

                        if (targets.length > 0) {
                            return {
                                eliminations: targets.map(id => [id, digit] as Candidate),
                                highlights: candidateCells.map(id => [id, digit] as Candidate),
                            };
                        }
                    }
                }
            }
        }

        return undefined;
    };
}

const xWing = makeBasicFish(2);
const swordfish = makeBasicFish(3);
const jellyfish = makeBasicFish(4);


const skyscraper: StrategyFunction = (board: Board) => {
    const vertical = makeBasicChain(["bilocalColumn"], ["weakRow"], 4, 4)(board);
    if (isSome(vertical)) {
        return vertical;
    }

    const horizontal = makeBasicChain(["bilocalRow"], ["weakColumn"], 4, 4)(board);
    if (isSome(horizontal)) {
        return horizontal;
    }

    return undefined;
};

const kite = makeBasicChain(["bilocalRow", "bilocalColumn"], ["weakBox"], 4, 4);

const turbotFish = makeBasicChain(["bilocal"], ["weakUnit"], 4, 4);


const yWing = makeBasicChain(["bivalue"], ["weakUnit"], 6, 6);

const xyzWing: StrategyFunction = (board: Board) => {
    for (const xyzId of CELLS) {
        const xyz = board.cell(xyzId).candidates;

        if (xyz.length !== 3) {
            continue;
        }

        const bivalueNeighbors = board.getVisible(xyzId)
            .filter(id => board.cell(id).candidates.length === 2)
            .filter(id => isSubset(board.cell(id).candidates, xyz));

        for (const [xzId, yzId] of pairsOf(bivalueNeighbors)) {
            const xz = board.cell(xzId).candidates;
            const yz = board.cell(yzId).candidates;

            if (isSubset(xz, yz)) {
                continue;
            }

            const z = intersection(xz, yz)[0];

            const eliminations = board.getDigitEliminations(z, [xyzId, xzId, yzId]);

            if (eliminations.length > 0) {
                const x = xz.filter(notEqual(z))[0];
                const y = yz.filter(notEqual(z))[0];

                return {
                    eliminations,
                    highlights: [[xyzId, x], [xyzId, y], [xyzId, z], [xzId, x], [xzId, z], [yzId, y], [yzId, z]],
                };
            }
        }

    }

    return undefined;
};

const wWing: StrategyFunction = (board: Board) => {
    for (const x of DIGITS) {
        for (const baseUnit of UNITS) {
            const xCells = baseUnit.filter(board.cellHasCandidate(x));

            if (xCells.length !== 2) {
                continue;
            }

            const wxCells = xCells.map(xId =>
                board.getVisible(xId)
                    .filter(notIn(baseUnit))
                    .filter(wxId => {
                        const wx = board.cell(wxId).candidates;
                        return wx.length === 2 && wx.includes(x);
                    })
            );

            for (const wx1Id of wxCells[0]) {
                const w = board.cell(wx1Id).candidates.find(notEqual(x))!;

                for (const wx2Id of wxCells[1].filter(board.cellHasCandidate(w))) {

                    const eliminations = board.getDigitEliminations(w, [wx1Id, wx2Id]);

                    if (eliminations.length > 0) {
                        const [x1Id, x2Id] = xCells;

                        return {
                            eliminations,
                            highlights: [[wx1Id, w], [wx2Id, w]],
                            highlights2: [[x1Id, x], [x2Id, x], [wx1Id, x], [wx2Id, x]],
                        };
                    }
                }
            }
        }
    }

    return undefined;
};


// const uniqueRectangle: StrategyFunction = (board: Board) => {
//     // todo

//     return undefined;
// }

const bug: StrategyFunction = (board: Board) => {
    const nonBivalueCells = CELLS
        .filter(id => !board.cell(id).hasDigit())
        .filter(id => board.cell(id).candidates.length !== 2);

    if (nonBivalueCells.length !== 1) {
        return undefined;
    }

    const bugId = nonBivalueCells[0];

    const bugCandidates = board.cell(bugId).candidates;

    if (bugCandidates.length !== 3) {
        return undefined;
    }

    for (const digit of bugCandidates) {
        for (const unit of UNITS.filter(contains(bugId))) {
            const count = unit.filter(board.cellHasCandidate(digit)).length;

            if (count !== 3) {
                break;
            }

            return {
                solutions: [[bugId, digit]],
            };
        }
    }



    return undefined;
};

const xChainSimple = makeBasicChain(["bilocal"], ["bilocal"]);
const xChainAlternating = makeBasicChain(["bilocal"], ["weakUnit"]);
const xyChain = makeBasicChain(["bivalue"], ["weakUnit"]);

const aic = makeBasicChain(["bivalue", "bilocal"], ["weakUnit", "weakCell"]);

export type Strategy = [name: string, func: StrategyFunction];

export const STRATEGIES: Strategy[] = [
    ["revise notes", reviseNotes],
    ["full house", fullHouse],
    ["naked single", nakedSingle],
    ["hidden single", hiddenSingle],
    ["naked pair", nakedPair],
    ["hidden pair", hiddenPair],
    ["naked triple", nakedTriple],
    ["hidden triple", hiddenTriple],
    ["intersection pointing", intersectionPointing],
    ["intersection claiming", intersectionClaiming],
    ["naked quad", nakedQuad],
    ["hidden quad", hiddenQuad],
    ["x-wing", xWing],
    ["swordfish", swordfish],
    ["jellyfish", jellyfish],
    ["skyscraper", skyscraper],
    ["2-string kite", kite],
    ["turbot fish", turbotFish],
    ["x-chain (simple)", xChainSimple],
    ["x-chain (alternating)", xChainAlternating],
    ["y-wing", yWing],
    ["xyz-wing", xyzWing],
    ["w-wing", wWing],
    ["bug", bug],
    ["xy-chain", xyChain],
    ["aic", aic],
];