import { isNone, isSome, notEqual } from "./combinatorics";
import { Board, CELLS, CandidateId, CellId, DIGITS, Digit, StrategyFunction, StrategyResult, UNITS, cellIdOf, cidOf, cidToPair, digitOf } from "./sudoku";

type LinkClass = "bivalue" | "bilocal" | "weakCell" | "weakUnit";

export function makeChain(
    strongClasses: LinkClass[],
    weakClasses: LinkClass[],
    maxLength?: number,
): StrategyFunction {
    return (board: Board) => {
        const strongLinks = new CandidateLinks(board, strongClasses);
        const weakLinks = new CandidateLinks(board, weakClasses);

        const chains = findAlternatingChains(board, strongLinks, weakLinks, maxLength);

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

        if (linkTypes.includes("weakCell")) {
            this.findWeakCell(board);
        }

        if (linkTypes.includes("weakUnit")) {
            this.findWeakUnit(board);
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

            // check if chain

            if (u.digit === rootDigit && u.nextLink === "weak") {
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