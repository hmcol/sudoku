import React from "react";
import { MouseEventHandler } from 'react';
import "./Game.css";
import { Board, BOXES, Cell, CellId, Digit, DIGITS, parseDigit, STRATEGIES, Strategy, StrategyResult } from './lib/sudoku';
import { isNone, isSome } from "./lib/combinatorics";





type InputMode = "digit" | "note" | "accent" | "strike";

type GameState = {
    board: Board,
    history: Board[],
    selectedCells: Set<CellId>,
    inputMode: InputMode,
    focus?: Digit,
    result?: StrategyResult,
    strategyStatus: Map<string, "?" | "yes" | "no">;
};

export default class Game extends React.Component<any, GameState> {
    constructor(props: any) {
        super(props);

        this.state = {
            board: Board.fromString(
                "6.7..5.1.58...79......6......5.....9...936...3.....4......8......36...94.5.2..8.6"
            )!,
            history: [],
            selectedCells: new Set(),
            inputMode: "digit",
            strategyStatus: new Map(),
        };

        this.resetBoard = this.resetBoard.bind(this);
        this.loadBoardString = this.loadBoardString.bind(this);
        this.takeStep = this.takeStep.bind(this);
        this.undoStep = this.undoStep.bind(this);
        this.tryComplete = this.tryComplete.bind(this);

        this.handleClickCell = this.handleClickCell.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);

        this.updateInputMode = this.updateInputMode.bind(this);

        this.checkStrategy = this.checkStrategy.bind(this);
    }

    updateBoard(board: Board) {
        this.setState(prevState => ({
            board,
            history: prevState.history.concat(prevState.board),
        }));
    }

    resetBoard() {
        const board = this.state.history.length > 0 ?
            this.state.history[0] :
            this.state.board;

        this.setState({
            board,
            history: [],
        });

        this.resetSelection();
        this.resetKnowledge();
    }

    loadBoardString() {
        const str = prompt("Enter a string of at least 81 characters. The digits 1-9 are used to represent the given values. All other intermediate characters are interpreted as blanks. leading and trailing whitespace is ignored.");

        const board = Board.fromString(str ?? "");

        if (isNone(board)) {
            return;
        }

        this.setState({
            board,
            history: [board],
        });

        this.resetSelection();
        this.resetKnowledge();
    }

    resetSelection() {
        this.setState({
            selectedCells: new Set(),
            focus: undefined,
        });
    }

    resetKnowledge() {
        this.setState({
            result: undefined,
            strategyStatus: new Map(),
        });
    }

    handleClickCell(id: CellId) {
        this.state.board.cell(id).hasDigit() ?
            this.handleClickCellDigit(id) :
            this.handleClickCellNotes(id);
    }

    handleClickCellDigit(id: CellId) {
        const cell = this.state.board.cell(id);
        const digit = cell.digit!;
        const selectedCells = new Set(this.state.selectedCells);

        if (selectedCells.has(id)) {
            selectedCells.delete(id);
        } else if (!cell.isGiven) {
            selectedCells.clear();
            selectedCells.add(id);
        }

        this.setState({
            selectedCells,
            focus: digit !== this.state.focus ? digit : undefined,
        });
    }

    handleClickCellNotes(id: CellId) {
        const selectedCells = new Set(this.state.selectedCells);
        let inputMode = this.state.inputMode;

        if (selectedCells.has(id)) {
            selectedCells.delete(id);
        } else {
            selectedCells.clear();
            selectedCells.add(id);
            inputMode = "digit";
        }

        this.setState({
            selectedCells,
            focus: undefined,
            inputMode,
        });
    }

    handleMouseMove(id: CellId) {
        const selectedCells = new Set(this.state.selectedCells);

        selectedCells.add(id);

        this.setState({
            selectedCells,
            inputMode: "note"
        });
    }

    handleKeyDown(event: React.KeyboardEvent) {
        if (event.key === "Backspace" || event.key === "Delete") {
            this.clearSelection();
        }

        const digit = parseDigit(event.key);
        if (isNone(digit)) {
            return;
        }

        switch (this.state.inputMode) {
            case "digit":
                this.inputDigit(digit);
                break;
            case "note":
                // this.inputNote(digit, NoteType.BASIC);
                break;
            case "accent":
                // this.inputNote(digit, NoteType.ACCENT);
                break;
            case "strike":
                // this.inputNote(digit, NoteType.STRIKE);
                break;
        }
    }

    updateInputMode(inputMode: InputMode) {
        this.setState({
            inputMode: inputMode === this.state.inputMode ? "digit" : inputMode,
        });
    }

    inputDigit(digit: Digit) {
        const board = new Board(this.state.board);
        const selectedCells = new Set(this.state.selectedCells);

        for (const id of selectedCells) {
            board.inputDigit(id, digit);
        }

        this.updateBoard(board);

        this.setState({
            selectedCells: new Set(),
        });
    }

    // inputNote(digit: Digit, noteType: NoteType) {
    //     const board = new Board(this.state.board);
    //     const selectedCells = this.state.selectedCells;

    //     for (const id of selectedCells) {
    //         board.inputNote(id, digit, noteType);
    //     }

    //     this.setState({
    //         board: board,
    //         selectedCells: new Set(),
    //         inputMode: InputMode.DIGIT,
    //     });
    // }

    clearSelection() {
        const board = new Board(this.state.board);
        const selectedCells = this.state.selectedCells;

        for (const id of selectedCells) {
            board.clearCell(id);
        }

        this.updateBoard(board);

        this.setState({
            selectedCells: new Set(),
        });
    }

    // initializeNotes() {
    //     const board = new Board(this.state.board);

    //     board.initializeNotes();

    //     this.setState({
    //         board: board,
    //     });
    // }

    async tryComplete() {
        // console.log("try complete");

        if (await this.takeStep()) {
            setTimeout(this.tryComplete, 300);
        }
    }

    async takeStep() {
        if (isSome(this.state.result)) {
            this.applyCurrentResult();
            this.resetKnowledge();
            this.resetSelection();
            return true;
        }

        for (const strat of STRATEGIES) {
            if (await this.checkStrategy(strat)) {
                return true;
            }
        }

        console.log("no strategy found");
        return false;
    }

    undoStep() {
        this.setState(prevState => {
            const history = prevState.history;

            if (history.length === 0) {
                return {
                    board: prevState.board,
                    history: history,
                };
            }

            return {
                board: history[history.length - 1],
                history: history.slice(0, -1),
            };
        });

        this.resetKnowledge();
        this.resetSelection();
    }

    async checkStrategy([name, func]: Strategy): Promise<boolean> {
        // pre-computation
        this.setState(prevState => {
            const strategyStatus = new Map(prevState.strategyStatus);
            strategyStatus.set(name, "?");
            return {
                strategyStatus
            };
        });

        // start computation
        const board = new Board(this.state.board);

        const promise = new Promise<StrategyResult | undefined>((resolve, _) => {
            setTimeout(() => {
                resolve(func(board));
            }, 0);
        });

        const result = await promise;

        // post-computation
        const found = isSome(result);

        this.setState(prevState => {
            const strategyStatus = new Map(prevState.strategyStatus);
            strategyStatus.set(name, found ? "yes" : "no");
            return {
                strategyStatus
            };
        });

        if (found && name !== "revise notes") {
            console.log(name);
        }

        this.setState({
            result,
        });

        return found;
    }

    applyCurrentResult() {
        const board = new Board(this.state.board);
        const result = this.state.result;

        for (const [id, digit] of result?.solutions ?? []) {
            board.inputDigit(id, digit);
        }

        for (const [id, digit] of result?.eliminations ?? []) {
            // board.inputNote(id, digit, NoteType.ELIMINATED);
            board.cell(id).eliminateCandidate(digit);
        }

        this.updateBoard(board);
    }

    render() {
        return (
            <div className="game"
                tabIndex={-1}
                onKeyDown={(event) => this.handleKeyDown(event)}
            >
                <Grid
                    board={this.state.board}
                    selectedCells={this.state.selectedCells}
                    result={this.state.result}
                    focus={this.state.focus}
                    onClickCell={this.handleClickCell}
                    onMouseMove={this.handleMouseMove}
                />
                <div className="game-info">
                    <div>Sudoku</div>
                    <NoteSelector
                        inputMode={this.state.inputMode}
                        onClick={this.updateInputMode}
                    />
                    <SolverControls
                        onReset={this.resetBoard}
                        onLoadString={this.loadBoardString}
                        onStep={this.takeStep}
                        onUndo={this.undoStep}
                        onComplete={this.tryComplete}
                    />
                    <StrategyList
                        onClick={this.checkStrategy}
                        strategyStatus={this.state.strategyStatus}
                    />
                </div>
            </div>
        );
    }
}

type SolverControlsProps = {
    onLoadString: () => void,
    onReset: () => void,
    onStep: () => void,
    onUndo: () => void,
    onComplete: () => void,
};

function SolverControls(props: SolverControlsProps) {
    return (
        <div
            className="solver-controls"
        >
            <button onClick={props.onLoadString}>load</button>
            <button onClick={props.onReset}>reset</button>
            <button onClick={props.onUndo}>undo</button>
            <button onClick={props.onStep}>step</button>
            <button onClick={props.onComplete}>complete</button>
        </div>
    );
}

type GridProps = {
    board: Board,
    selectedCells: Set<CellId>,
    result?: StrategyResult,
    focus?: Digit,
    onClickCell: (id: CellId) => void,
    onMouseMove: (id: CellId) => void,
};

class Grid extends React.Component<GridProps> {

    renderCell(id: CellId) {
        const result = this.props.result;
        const filterCell = (set?: [CellId, Digit][]) => set?.filter(e => e[0] === id).map(e => e[1]);

        const solution = filterCell(result?.solutions)?.at(0);
        const eliminations = filterCell(result?.eliminations);
        const highlights = filterCell(result?.highlights);
        const highlights2 = filterCell(result?.highlights2);

        return (
            <CellComponent
                key={id}
                cell={this.props.board.cell(id)}
                selected={this.props.selectedCells.has(id)}
                solution={solution}
                eliminations={eliminations}
                highlights={highlights}
                highlights2={highlights2}
                focus={this.props.focus}
                onClick={() => this.props.onClickCell(id)}
                onMouseMove={(event) => event.buttons === 1 && this.props.onMouseMove(id)}
            />
        );
    }

    render() {
        return (
            <div className="grid">
                {BOXES.map((box, index) =>
                    <div className="box" key={index}>
                        {box.map((id) =>
                            this.renderCell(id)
                        )}
                    </div>
                )}
            </div>
        );
    }
}

type CellProps = {
    cell: Cell,
    selected: boolean,
    focus?: Digit,
    solution?: Digit,
    eliminations?: Digit[],
    highlights?: Digit[],
    highlights2?: Digit[],
    onClick: MouseEventHandler,
    onMouseMove: MouseEventHandler,
};

function CellComponent(props: CellProps) {
    const cell = props.cell;

    const selectors = buildConditionalSelectors({
        "selected": props.selected,
        "restricted": isSome(props.focus) && !cell.hasCandidate(props.focus),
    });

    const content = cell.hasDigit() ? (
        <CellDigit
            digit={cell.digit}
            isGiven={cell.isGiven}
            isFocus={cell.digit === props.focus}
        />
    ) : (
        <CellNotes
            candidates={cell.candidates}
            solution={props.solution}
            eliminations={props.eliminations}
            highlights={props.highlights}
            highlights2={props.highlights2}
        />
    );

    return (
        <div
            className={"cell" + selectors}
            onMouseDown={props.onClick}
            onMouseMove={props.onMouseMove}
        >
            {content}
        </div>
    );
};

type CellDigitProps = {
    digit: Digit,
    isGiven: boolean,
    isFocus: boolean,
};

function CellDigit(props: CellDigitProps) {
    const selectors = buildConditionalSelectors({
        "given": props.isGiven,
        "focus": props.isFocus,
    });

    return (
        <div
            className={"cell-digit" + selectors}
        >
            {props.digit}
        </div>
    );
}

type CellNotesProps = {
    candidates: Digit[],
    solution?: Digit,
    eliminations?: Digit[],
    highlights?: Digit[],
    highlights2?: Digit[],
};

function CellNotes(props: CellNotesProps) {
    function determineHighlightColor(digit: Digit) {
        if (props.solution === digit) {
            return "green";
        }
        if (props.eliminations?.includes(digit)) {
            return "red";
        }
        if (props.highlights?.includes(digit)) {
            return "blue";
        }
        if (props.highlights2?.includes(digit)) {
            return "yellow";
        }
        return undefined;
    }

    return (
        <div className={`cell-notes`}>
            {DIGITS.map(digit =>
                <Note
                    key={digit}
                    digit={digit}
                    shown={props.candidates.includes(digit)}
                    highlight={determineHighlightColor(digit)}
                />
            )}
        </div>
    );
}

type NoteProps = {
    digit: Digit,
    shown: boolean,
    highlight?: "red" | "green" | "blue" | "yellow",
};

function Note(props: NoteProps) {
    const color = props.highlight ?? "";

    const selectors = buildConditionalSelectors({
        [color]: isSome(props.highlight) && props.shown,
    });

    return (
        <div
            className={"note" + selectors}
        >
            {props.shown ? props.digit : " "}
        </div>
    );
};

type NoteSelectorProps = {
    inputMode: InputMode,
    onClick: (inputMode: InputMode) => void,
};

function NoteSelector(props: NoteSelectorProps) {
    function renderOption(inputMode: InputMode, label: string) {
        const selectors = buildConditionalSelectors({
            "selected": props.inputMode === inputMode,
        });

        return (
            <div
                className={"note-option" + selectors}
                onClick={() => props.onClick(inputMode)}
            >
                {label}
            </div>
        );

    }


    return (
        <div>
            User Note Mode
            <div className="note-selector">
                {renderOption("note", "N")}
                {renderOption("accent", "A")}
                {renderOption("strike", "E")}
            </div>
        </div>
    );

};

type StrategyListProps = {
    onClick: (strat: Strategy) => void;
    strategyStatus: Map<string, "?" | "yes" | "no">;
};

function StrategyList(props: StrategyListProps) {
    function renderItem(strat: Strategy, index: number) {
        return (
            <div className="strategy-item" key={index}>
                <div className="strategy-number">
                    {String(index).padStart(2, "0")}
                </div>
                <div className={"strategy-name"}>
                    {strat[0]}
                </div>
                <div className={"strategy-status"}
                    onClick={() => props.onClick(strat)}
                >
                    {props.strategyStatus.get(strat[0]) ?? " "}
                </div>
            </div>
        );
    }

    return (
        <>
            Strategies
            <div className="strategy-list">
                {STRATEGIES.map(renderItem)}
            </div>
        </>
    );
};


// helper functions -----------------------------------------------------------

function buildConditionalSelectors(args: { [selector: string]: boolean; }) {
    const selectors = Object.entries(args)
        .filter(([_, condition]) => condition)
        .map(([selector, _]) => selector);

    return [""].concat(selectors).join(" ");
}