import { isNone, isSome, notEqual } from "./combinatorics";
import { BOXES, Board, CELLS, COLUMNS, Candidate, CandidateId, CellId, DIGITS, Digit, ROWS, StrategyFunction, StrategyResult, UNITS, cellIdOf, cidOf, cidToPair, digitOf } from "./sudoku";

type LinkClass = "bivalue" | "bilocal" | "bilocalBox" | "bilocalRow" | "bilocalColumn" | "weakCell" | "weakUnit" | "weakBox" | "weakRow" | "weakColumn";

export function makeBasicChain(
    strongClasses: LinkClass[],
    weakClasses: LinkClass[],
    minLength?: number,
    maxLength?: number,
): StrategyFunction {
    return (board: Board) => {
        const strongLinks = new CandidateLinks(board, strongClasses);
        const weakLinks = new CandidateLinks(board, weakClasses);

        const chains = findAlternatingChains(board, strongLinks, weakLinks, minLength, maxLength);

        // console.log(chains);

        return shortestChain(chains);
    };
}

class CandidateLinks {
    links: Map<CandidateId, CandidateId[]>;

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

    add(source: CandidateId, target: CandidateId) {
        if (isNone(this.links.get(source))) {
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

            const [cid1, cid2] = candidateCells.map(id => cidOf(id, digit));

            this.add(cid1, cid2);
            this.add(cid2, cid1);
        }
    }

    findStrongBilocalSpecific(board: Board, units: CellId[][]) {
        for (const digit of DIGITS) {
            for (const unit of units) {
                const candidateCells = unit.filter(id =>
                    board.cell(id).hasCandidate(digit)
                );

                if (candidateCells.length !== 2) {
                    continue;
                }

                const [cid1, cid2] = candidateCells.map(id => cidOf(id, digit));

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
                for (const digit2 of candidates.filter(notEqual(digit1))) {
                    this.add(cidOf(id, digit1), cidOf(id, digit2));
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
                for (const id2 of candidateCells.filter(notEqual(id1))) {
                    this.add(cidOf(id1, digit), cidOf(id2, digit));
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

    findWeakUnitSpecific(board: Board, units: CellId[][]) {
        for (const digit of DIGITS) {
            for (const unit of units) {
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
    }
}

type LinkType = "strong" | "weak";

function oppLink(link: LinkType): LinkType {
    return link === "strong" ? "weak" : "strong";
}

type QueueItem = {
    cid: CandidateId,
    id: CellId,
    digit: Digit,
    nextLink: LinkType,
    depth: number,
};

function newStackItem(cid: CandidateId, nextLink: LinkType, depth: number = 1): QueueItem {
    return {
        cid: cid,
        id: cellIdOf(cid),
        digit: digitOf(cid),
        nextLink: nextLink,
        depth,
    };
}

type ChainResult = [CandidateId[], StrategyResult];

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
        const [rootId, rootDigit] = cidToPair(root);

        const queue: QueueItem[] = [];
        const visited = new Set<CandidateId>();
        const parents = new Map<CandidateId, CandidateId>();

        queue.push(newStackItem(root, "strong"));

        while (queue.length > 0) {
            const u = queue.shift()!;

            // if chain is nontrivial and ends with a strong link
            if (u.depth >= (minLength ?? 4) && u.nextLink === "weak") {

                // type 1: same digit on both ends
                if (u.digit === rootDigit) {
                    const eliminations = board.getDigitEliminations(rootDigit, [rootId, u.id]);

                    if (eliminations.length > 0) {
                        const chain = backtrackChain(u.cid, parents);

                        const highlights = chain.filter((_, i) => i % 2 === 0).map(cidToPair);
                        const highlights2 = chain.filter((_, i) => i % 2 === 1).map(cidToPair);

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
                    && UNITS.some(unit => unit.includes(rootId) && unit.includes(u.id))
                ) {
                    const eliminations: Candidate[] = [];

                    if (board.cell(rootId).hasCandidate(u.digit)) {
                        eliminations.push([rootId, u.digit]);
                    }

                    if (board.cell(u.id).hasCandidate(rootDigit)) {
                        eliminations.push([u.id, rootDigit]);
                    }

                    if (eliminations.length > 0) {
                        const chain = backtrackChain(u.cid, parents);

                        const highlights = chain.filter((_, i) => i % 2 === 0).map(cidToPair);
                        const highlights2 = chain.filter((_, i) => i % 2 === 1).map(cidToPair);

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

            visited.add(u.cid);

            if (isSome(maxLength) && u.depth >= maxLength) {
                continue;
            }

            for (const vCid of links[u.nextLink].get(u.cid)) {
                if (visited.has(vCid)) {
                    continue;
                }

                parents.set(vCid, u.cid);
                queue.push(newStackItem(
                    vCid,
                    oppLink(u.nextLink),
                    u.depth + 1,
                ));
            }
        }
    }

    return chains;
}

function backtrackChain(end: CandidateId, parents: Map<CandidateId, CandidateId>): CandidateId[] {
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