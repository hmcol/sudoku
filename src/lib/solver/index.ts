import { reviseNotes } from "./revise notes";
import { fullHouse, nakedSingle, hiddenSingle } from "./singles";
import { aic, xChain, xChainSimple, xyChain } from "./chains";
import { hiddenRectangle, ur1, ur2, ur4, ur5 } from "./unique rectangle";
import { nakedPair, nakedTriple, nakedQuad } from "./naked subsets";
import { hiddenPair, hiddenTriple, hiddenQuad } from "./hidden subsets";
import { intersectionPointing, intersectionClaiming } from "./intersections";
import { xWing, swordfish, jellyfish } from "./basic fish";
import { skyscraper, kite, turbotFish } from "./single digit patterns";
import { yWing, xyzWing, wWing } from "./wings";
import { bugPlusOne } from "./bug";
import { Board, Candidate } from "../sudoku";

export type StrategyResult = {
    solutions?: Array<Candidate>;
    eliminations?: Array<Candidate>;
    highlights?: Array<Candidate>;
    highlights2?: Array<Candidate>;
};

export type Strategy = {
    name: string,
    func: (board: Board) => StrategyResult | undefined,
};

export const STRATEGIES: Strategy[] = [
    reviseNotes,
    fullHouse,
    nakedSingle,
    hiddenSingle,
    nakedPair,
    hiddenPair,
    nakedTriple,
    hiddenTriple,
    intersectionPointing,
    intersectionClaiming,
    nakedQuad,
    hiddenQuad,
    xWing,
    swordfish,
    jellyfish,
    skyscraper,
    kite,
    turbotFish,
    xChainSimple,
    xChain,
    yWing,
    xyzWing,
    wWing,
    ur1,
    ur2,
    ur4,
    ur5,
    hiddenRectangle,
    bugPlusOne,
    xyChain,
    aic,
];
