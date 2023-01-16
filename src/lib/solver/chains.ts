import { isNone, isSome, notEq } from "../combinatorics";
import { CELLS, Cell, Candidate, cellOf, newCandidate, digitOf, BOXES, COLUMNS, ROWS, UNITS, DIGITS, Digit, Board } from "../sudoku";
import { Strategy, StrategyResult } from ".";

export const xChainSimple: Strategy = {
    name: "x-chain simple",
    func: makeBasicChain(["bilocal"], ["bilocal"]),
};

export const xChain: Strategy = {
    name: "x-chain alternating",
    func: makeBasicChain(["bilocal"], ["weakUnit"]),
};

export const xyChain: Strategy = {
    name: "xy-chain",
    func: makeBasicChain(["bivalue"], ["weakUnit"]),
};


export const aic: Strategy = {
    name: "aic",
    func: makeBasicChain(["bivalue", "bilocal"], ["weakUnit", "weakCell"])
};

type LinkClass = "bivalue" | "bilocal" | "bilocalBox" | "bilocalRow" | "bilocalColumn" | "weakCell" | "weakUnit" | "weakBox" | "weakRow" | "weakColumn";

export function makeBasicChain(
    strongClasses: LinkClass[],
    weakClasses: LinkClass[],
    minLength?: number,
    maxLength?: number,
) {
    return (board: Board) => {
        const strongLinks = new CandidateLinks(board, strongClasses);
        const weakLinks = new CandidateLinks(board, weakClasses);

        const chains = findAlternatingChains(board, strongLinks, weakLinks, minLength, maxLength);

        // console.log(chains);

        return shortestChain(chains);
    };
}

class CandidateLinks {
    links: Map<Candidate, Candidate[]>;

    constructor(board: Board, linkTypes: LinkClass[]) {
        this.links = new Map();

        if (linkTypes.includes("bivalue")) {
            this.findStrongBivalue(board);
        }

        if (linkTypes.includes("bilocal")) {
            this.findStrongBilocal(board);
        }

        if (linkTypes.includes("bilocalBox")) {
            this.findStrongBilocalBox(board);
        }

        if (linkTypes.includes("bilocalRow")) {
            this.findStrongBilocalRow(board);
        }

        if (linkTypes.includes("bilocalColumn")) {
            this.findStrongBilocalColumn(board);
        }

        if (linkTypes.includes("weakCell")) {
            this.findWeakCell(board);
        }

        if (linkTypes.includes("weakUnit")) {
            this.findWeakUnit(board);
        }

        if (linkTypes.includes("weakBox")) {
            this.findWeakBox(board);
        }

        if (linkTypes.includes("weakRow")) {
            this.findWeakRow(board);
        }

        if (linkTypes.includes("weakColumn")) {
            this.findWeakColumn(board);
        }
    }

    get candidates() {
        return this.links.keys();
    }

    add(source: Candidate, target: Candidate) {
        if (isNone(this.links.get(source))) {
            this.links.set(source, []);
        }

        this.links.get(source)?.push(target);
    }

    get(source: Candidate): Candidate[] {
        return this.links.get(source) ?? [];
    }

    // strong link finders

    findStrongBivalue(board: Board) {
        const bivalueCells = CELLS.filter(id => board.cell(id).candidates.length === 2);
        for (const id of bivalueCells) {
            const [x, y] = board.cell(id).candidates.map(c => newCandidate(id, c));

            this.add(x, y);
            this.add(y, x);
        }
    }

    findStrongBilocal(board: Board) {
        for (const digit of DIGITS) {
            this.findStrongBilocalDigit(board, digit);
        }
    }

    findStrongBilocalDigit(board: Board, digit: Digit) {
        for (const unit of UNITS) {
            const candidateCells = unit.filter(id =>
                board.cell(id).hasCandidate(digit)
            );

            if (candidateCells.length !== 2) {
                continue;
            }

            const [cid1, cid2] = candidateCells.map(id => newCandidate(id, digit));

            this.add(cid1, cid2);
            this.add(cid2, cid1);
        }
    }

    findStrongBilocalSpecific(board: Board, units: Cell[][]) {
        for (const digit of DIGITS) {
            for (const unit of units) {
                const candidateCells = unit.filter(id =>
                    board.cell(id).hasCandidate(digit)
                );

                if (candidateCells.length !== 2) {
                    continue;
                }

                const [cid1, cid2] = candidateCells.map(id => newCandidate(id, digit));

                this.add(cid1, cid2);
                this.add(cid2, cid1);
            }
        }
    }

    findStrongBilocalBox(board: Board) {
        this.findStrongBilocalSpecific(board, BOXES);
    }

    findStrongBilocalRow(board: Board) {
        this.findStrongBilocalSpecific(board, ROWS);
    }

    findStrongBilocalColumn(board: Board) {
        this.findStrongBilocalSpecific(board, COLUMNS);
    }

    // weak link finders

    findWeakCell(board: Board) {
        for (const id of CELLS) {
            const candidates = board.cell(id).candidates;

            for (const digit1 of candidates) {
                for (const digit2 of candidates.filter(notEq(digit1))) {
                    this.add(newCandidate(id, digit1), newCandidate(id, digit2));
                }
            }
        }
    }

    findWeakUnit(board: Board) {
        for (const digit of DIGITS) {
            this.findWeakUnitDigit(board, digit);
        }
    }

    findWeakUnitDigit(board: Board, digit: Digit) {
        for (const unit of UNITS) {
            const candidateCells = unit.filter((id) =>
                board.cell(id).hasCandidate(digit)
            );

            for (const id1 of candidateCells) {
                for (const id2 of candidateCells.filter(notEq(id1))) {
                    this.add(newCandidate(id1, digit), newCandidate(id2, digit));
                }
            }

        }
    }

    findWeakBox(board: Board) {
        this.findWeakUnitSpecific(board, BOXES);
    }

    findWeakRow(board: Board) {
        this.findWeakUnitSpecific(board, ROWS);
    }

    findWeakColumn(board: Board) {
        this.findWeakUnitSpecific(board, COLUMNS);
    }

    findWeakUnitSpecific(board: Board, units: Cell[][]) {
        for (const digit of DIGITS) {
            for (const unit of units) {
                const candidateCells = unit.filter((id) =>
                    board.cell(id).hasCandidate(digit)
                );

                for (const id1 of candidateCells) {
                    for (const id2 of candidateCells.filter(notEq(id1))) {
                        this.add(newCandidate(id1, digit), newCandidate(id2, digit));
                    }
                }

            }
        }
    }
}

type LinkType = "strong" | "weak";

function oppLink(link: LinkType): LinkType {
    return link === "strong" ? "weak" : "strong";
}

type QueueItem = {
    candidate: Candidate,
    cell: Cell,
    digit: Digit,
    nextLink: LinkType,
    depth: number,
};

function newQueueItem(candidate: Candidate, nextLink: LinkType, depth: number = 1): QueueItem {
    return {
        candidate: candidate,
        cell: cellOf(candidate),
        digit: digitOf(candidate),
        nextLink: nextLink,
        depth,
    };
}

type ChainResult = [Candidate[], StrategyResult];

function findAlternatingChains(
    board: Board,
    strongLinks: CandidateLinks,
    weakLinks: CandidateLinks,
    minLength?: number,
    maxLength?: number,
): ChainResult[] {
    const chains = new Array<ChainResult>();

    const links = {
        "strong": strongLinks,
        "weak": weakLinks,
    };

    for (const root of strongLinks.candidates) {
        const rootCell = cellOf(root);
        const rootDigit = digitOf(root);

        const queue: QueueItem[] = [];
        const visited = new Set<Candidate>();
        const parents = new Map<Candidate, Candidate>();

        queue.push(newQueueItem(root, "strong"));

        while (queue.length > 0) {
            const u = queue.shift()!;

            // if chain is nontrivial and ends with a strong link
            if (u.depth >= (minLength ?? 4) && u.nextLink === "weak") {

                // type 1: same digit on both ends
                if (u.digit === rootDigit) {
                    const eliminations = board.getDigitEliminations(rootDigit, [rootCell, u.cell]);

                    if (eliminations.length > 0) {
                        const chain = backtrackChain(u.candidate, parents);

                        const highlights = chain.filter((_, i) => i % 2 === 0);
                        const highlights2 = chain.filter((_, i) => i % 2 === 1);

                        chains.push([
                            chain,
                            {
                                eliminations,
                                highlights,
                                highlights2,
                            }
                        ]);
                    }
                }

                // type 2: different digits which see each other
                if (
                    u.digit !== rootDigit
                    && UNITS.some(unit => unit.includes(rootCell) && unit.includes(u.cell))
                ) {
                    const eliminations = new Array<Candidate>();

                    if (board.cell(rootCell).hasCandidate(u.digit)) {
                        eliminations.push(newCandidate(rootCell, u.digit));
                    }

                    if (board.cell(u.cell).hasCandidate(rootDigit)) {
                        eliminations.push(newCandidate(u.cell, rootDigit));
                    }

                    if (eliminations.length > 0) {
                        const chain = backtrackChain(u.candidate, parents);

                        const highlights = chain.filter((_, i) => i % 2 === 0);
                        const highlights2 = chain.filter((_, i) => i % 2 === 1);

                        chains.push([
                            chain,
                            {
                                eliminations,
                                highlights,
                                highlights2,
                            }
                        ]);
                    }
                }
            }

            // keep looking

            visited.add(u.candidate);

            if (isSome(maxLength) && u.depth >= maxLength) {
                continue;
            }

            for (const vCid of links[u.nextLink].get(u.candidate)) {
                if (visited.has(vCid)) {
                    continue;
                }

                parents.set(vCid, u.candidate);
                queue.push(newQueueItem(
                    vCid,
                    oppLink(u.nextLink),
                    u.depth + 1,
                ));
            }
        }
    }

    return chains;
}

function backtrackChain(end: Candidate, parents: Map<Candidate, Candidate>): Candidate[] {
    const chain = [end];

    let v = end;
    while (parents.has(v)) {
        v = parents.get(v)!;
        chain.push(v);
    }

    return chain;
}

function shortestChain(chains: ChainResult[]): StrategyResult | undefined {
    if (chains.length === 0) {
        return undefined;
    }

    const shortest = chains.reduce((acc, cur) =>
        acc[0].length <= cur[0].length ? acc : cur,
    );

    return shortest[1];
}

