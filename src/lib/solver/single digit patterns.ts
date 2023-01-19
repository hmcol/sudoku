import { Strategy } from ".";
import { isSome } from "../util/option";
import { Board } from "../sudoku";
import { makeBasicChain } from "./chains";

export const skyscraper: Strategy = {
    name: "skyscraper",
    func: (board: Board) => {
        const vertical = makeBasicChain(["bilocalColumn"], ["weakRow"], 4, 4)(board);
        if (isSome(vertical)) {
            return vertical;
        }

        const horizontal = makeBasicChain(["bilocalRow"], ["weakColumn"], 4, 4)(board);
        if (isSome(horizontal)) {
            return horizontal;
        }

        return undefined;
    },
};


export const kite: Strategy = {
    name: "kite",
    func: makeBasicChain(["bilocalRow", "bilocalColumn"], ["weakBox"], 4, 4),
};

export const turbotFish: Strategy = {
    name: "turbot fish",
    func: makeBasicChain(["bilocal"], ["weakUnit"], 4, 4),
};
