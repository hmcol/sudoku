import { isSome } from "../combinatorics";
import { Board } from "../sudoku";
import { StrategyFunction } from "./types";
import { makeBasicChain } from "./chains";

export const skyscraper: StrategyFunction = (board: Board) => {
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
export const kite = makeBasicChain(["bilocalRow", "bilocalColumn"], ["weakBox"], 4, 4);
export const turbotFish = makeBasicChain(["bilocal"], ["weakUnit"], 4, 4);
