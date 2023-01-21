import { reviseNotes } from "./revise notes";
import { fullHouse, nakedSingle, hiddenSingle } from "./singles";
import { aic, xChain, xChainSimple, xyChain } from "./chains";
import { hiddenRectangle, ur1, ur2, ur4, ur5 } from "./unique rectangle";
import { nakedPair, nakedTriple, nakedQuad } from "./naked subsets";
import { hiddenPair, hiddenTriple, hiddenQuad } from "./hidden subsets";
import { intersectionPointing, intersectionClaiming } from "./intersections";
import { xWing, swordfish, jellyfish } from "./basic fish";
import { skyscraper, kite, turbotFish } from "./single digit patterns";
import { xyWing, xyzWing, wWing } from "./wings";
import { bugPlusOne } from "./bug";
import { Board, Candidate } from "../sudoku";
// import { LinkCache } from "./links";
import { Option } from "../util/option";

export type StrategyResult = {
    solutions?: Candidate[];
    eliminations?: Candidate[];
    highlights?: Candidate[];
    highlights2?: Candidate[];
};

export type Strategy = {
    name: string;
    func: (board: Board) => Option<StrategyResult>;
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
    xyWing,
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
