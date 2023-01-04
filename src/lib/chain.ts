import { notEqual } from "./combinatorics";
import { Board, CELLS, CandidateId, CellId, DIGITS, Digit, StrategyFunction, StrategyResult, UNITS, cellIdOf, cidOf, cidToPair, digitOf } from "./sudoku";

type LinkClass = "bivalue" | "bilocal" | "weakCell" | "weakUnit";

export function makeChain(strong: LinkClass[], weak: LinkClass[]): StrategyFunction {
    return (board: Board) => {
        const strongLinks = new CandidateLinks(board, strong);
        const weakLinks = new CandidateLinks(board, weak);

        const chains = findAlternatingChains(board, strongLinks, weakLinks);

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

type StackItem = {
    cid: CandidateId,
    id: CellId,
    digit: Digit,
    nextLink: "strong" | "weak",
};

function newStackItem(cid: CandidateId, nextLink: "strong" | "weak"): StackItem {
    return {
        cid: cid,
        id: cellIdOf(cid),
        digit: digitOf(cid),
        nextLink: nextLink,
    };
}

type ChainResult = [CandidateId[], StrategyResult];

function findAlternatingChains(
    board: Board,
    strongLinks: CandidateLinks,
    weakLinks: CandidateLinks
): ChainResult[] {
    const chains = new Array<ChainResult>();

    for (const root of strongLinks.candidates) {
        const [rootId, rootDigit] = cidToPair(root);

        const queue: StackItem[] = [];
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

            const links = u.nextLink === "strong" ? strongLinks : weakLinks;

            for (const vCid of links.get(u.cid)) {
                if (visited.has(vCid)) {
                    continue;
                }

                parents.set(vCid, u.cid);
                queue.push(newStackItem(
                    vCid,
                    u.nextLink === "strong" ? "weak" : "strong")
                );
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