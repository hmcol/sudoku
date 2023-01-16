import { reviseNotes } from "./revise notes";
import { fullHouse, nakedSingle, hiddenSingle } from "./singles";
import { aic, xChain, xChainSimple, xyChain } from "./chains";
import { uniqueRectangle, ur1, ur2, ur4 } from "./unique rectangle";
import { nakedPair, nakedTriple, nakedQuad } from "./naked subsets";
import { hiddenPair, hiddenTriple, hiddenQuad } from "./hidden subsets";
import { intersectionPointing, intersectionClaiming } from "./intersections";
import { xWing, swordfish, jellyfish } from "./basic fish";
import { skyscraper, kite, turbotFish } from "./single digit patterns";
import { yWing, xyzWing, wWing } from "./wings";
import { bugPlusOne } from "./bug";
import { Board, CellDigitPair } from "../sudoku";

export type StrategyResult = {
    solutions?: Array<CellDigitPair>;
    eliminations?: Array<CellDigitPair>;
    highlights?: Array<CellDigitPair>;
    highlights2?: Array<CellDigitPair>;
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
    uniqueRectangle,
    bugPlusOne,
    xyChain,
    aic,
];
