import { StrategyFunction } from "./types";
import { reviseNotes } from "./revise notes";
import { fullHouse, nakedSingle, hiddenSingle } from "./singles";
import { aic, xChainAlternating, xChainSimple, xyChain } from "./chains";
import { uniqueRectangle } from "./unique rectangle";
import { nakedPair, nakedTriple, nakedQuad } from "./naked subsets";
import { hiddenPair, hiddenTriple, hiddenQuad } from "./hidden subsets";
import { intersectionPointing, intersectionClaiming } from "./intersections";
import { xWing, swordfish, jellyfish } from "./basic fish";
import { skyscraper, kite, turbotFish } from "./single digit patterns";
import { yWing, xyzWing, wWing } from "./wings";
import { bugPlusOne } from "./bug";


export * from "./types";

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
    ["unique rectangle", uniqueRectangle],
    ["bug+1", bugPlusOne],
    ["xy-chain", xyChain],
    ["aic", aic],
];
