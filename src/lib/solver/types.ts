import { Board, CellDigitPair } from "../sudoku";

export type StrategyResult = {
    solutions?: Array<CellDigitPair>;
    eliminations?: Array<CellDigitPair>;
    highlights?: Array<CellDigitPair>;
    highlights2?: Array<CellDigitPair>;
};

export type StrategyFunction = (board: Board) => StrategyResult | undefined;