import { Option, isSome } from "../util/option";
import { CellId, Candidate, cellOf, newCandidate, digitOf, UNITS, Digit, Board } from "../sudoku";
import { Strategy, StrategyResult } from ".";
import { LinkClass, LinkSet, getLinks } from "./links";

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


export function makeBasicChain(
    strongClasses: LinkClass[],
    weakClasses: LinkClass[],
    minLength?: number,
    maxLength?: number,
) {
    return (board: Board) => {
        const strong = getLinks(board.links, strongClasses);
        const weak = getLinks(board.links, weakClasses);

        const chains = findAlternatingChains(board, strong, weak, minLength, maxLength);

        return shortestChain(chains);
    };
}

type LinkType = "strong" | "weak";

function oppLink(link: LinkType): LinkType {
    return link === "strong" ? "weak" : "strong";
}

type QueueItem = {
    candidate: Candidate,
    cellId: CellId,
    digit: Digit,
    nextLink: LinkType,
    depth: number,
};

function newQueueItem(candidate: Candidate, nextLink: LinkType, depth: number = 1): QueueItem {
    return {
        candidate: candidate,
        cellId: cellOf(candidate),
        digit: digitOf(candidate),
        nextLink: nextLink,
        depth,
    };
}

type ChainResult = [Candidate[], StrategyResult];

function findAlternatingChains(
    board: Board,
    strongLinks: LinkSet,
    weakLinks: LinkSet,
    minLength?: number,
    maxLength?: number,
): ChainResult[] {
    const chains = new Array<ChainResult>();

    const links = {
        "strong": strongLinks,
        "weak": weakLinks,
    };

    for (const root of strongLinks.keys()) {
        const rootId = cellOf(root);
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
                    // const targets = board.getNeighborsIntersection(rootId, u.cellId);

                    const eliminations = board.getDigitEliminations(rootDigit, [rootId, u.cellId]);

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
                    u.digit !== rootDigit && u.cellId !== rootId
                    && UNITS.some(unit => unit.includes(rootId) && unit.includes(u.cellId))
                ) {
                    const eliminations = new Array<Candidate>();

                    if (board.cells[rootId].hasCandidate(u.digit)) {
                        eliminations.push(newCandidate(rootId, u.digit));
                    }

                    if (board.cells[u.cellId].hasCandidate(rootDigit)) {
                        eliminations.push(newCandidate(u.cellId, rootDigit));
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

function shortestChain(chains: ChainResult[]): Option<StrategyResult> {
    if (chains.length === 0) {
        return undefined;
    }

    const shortest = chains.reduce((acc, cur) =>
        acc[0].length <= cur[0].length ? acc : cur,
    );

    return shortest[1];
}

