import React from "react";
import { MouseEventHandler } from 'react';
import "./Game.css";
import { Board, BOXES, Cell, CellId, Digit, DIGITS, parseDigit, STRATEGIES, Strategy, StrategyFunction, StrategyResult } from './sudoku';



const enum InputMode {
    DIGIT,
    NOTE,
    ACCENT,
    STRIKE,
}

type NoteProps = {
    digit: Digit,
    shown: boolean,
    solved: boolean,
    eliminated: boolean,
    highlighted: boolean,
    highlighted2: boolean,
};

class NoteComponent extends React.Component<NoteProps> {
    render() {
        const shown = this.props.shown;

        const solved = this.props.solved && shown ? "solved" : "";
        const eliminated = this.props.eliminated && shown ? "eliminated" : "";
        const highlighted = this.props.highlighted && shown ? "highlighted" : "";
        const highlighted2 = this.props.highlighted2 && shown ? "highlighted2" : "";

        return (
            <div
                className={`note ${solved} ${eliminated} ${highlighted} ${highlighted2}`}
            >
                {this.props.shown ? this.props.digit : " "}
            </div>
        );
    }
}


type CellProps = {
    cell: Cell,
    selected: boolean,
    solution?: Digit,
    eliminations?: Digit[],
    highlights?: Digit[],
    highlights2?: Digit[],
    focus?: Digit,
    onClick: MouseEventHandler,
    onClickDigit: MouseEventHandler,
    onMouseMove: MouseEventHandler,
};

class CellComponent extends React.Component<CellProps> {
    render() {
        const cell = this.props.cell;

        const selected = this.props.selected ? "selected" : "";
        const restricted = this.props.focus !== undefined && !cell.hasCandidate(this.props.focus) ? "restricted" : "";


        if (cell.hasDigit()) {
            const given = cell.given ? "given" : "";
            const focus = this.props.focus === cell.digit ? "focus" : "";

            return (
                <div
                    className={`cell ${given} ${selected} ${focus} ${restricted}`}
                    onClick={this.props.onClickDigit}
                >
                    {cell.digit}
                </div>
            );
        }

        return (
            <div
                className={`cell notes ${selected} ${restricted}`}
                onClick={this.props.onClick}
                onMouseMove={this.props.onMouseMove}
            >
                {DIGITS.map(digit =>
                    <NoteComponent
                        key={digit}
                        digit={digit}
                        shown={cell.hasCandidate(digit)}
                        solved={this.props.solution === digit}
                        eliminated={this.props.eliminations?.includes(digit) ?? false}
                        highlighted={this.props.highlights?.includes(digit) ?? false}
                        highlighted2={this.props.highlights2?.includes(digit) ?? false}
                    />
                )}
            </div>
        );
    }
}

type GridProps = {
    board: Board,
    selectedCells: Set<CellId>,
    result?: StrategyResult,
    focus?: Digit,
    onClick: (id: CellId) => void,
    onClickDigit: (cellId: CellId) => void,
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
                onClick={() => this.props.onClick(id)}
                onClickDigit={() => this.props.onClickDigit(id)}
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

type NoteSelectorProps = {
    inputMode: InputMode,
    onClick: (inputMode: InputMode) => void,
};

class NoteSelector extends React.Component<NoteSelectorProps> {
    renderOption(inputMode: InputMode) {
        let label;

        switch (inputMode) {
            case InputMode.NOTE:
                label = "N";
                break;
            case InputMode.ACCENT:
                label = "A";
                break;
            case InputMode.STRIKE:
                label = "E";
                break;
        }

        return (
            <div
                className={`note-option ${this.props.inputMode === inputMode ? "selected" : ""}`}
                onClick={() => this.props.onClick(inputMode)}
            >
                {label}
            </div>
        );

    }

    render() {
        return (
            <div>
                User Note Mode
                <div className="note-selector">
                    {this.renderOption(InputMode.NOTE)}
                    {this.renderOption(InputMode.ACCENT)}
                    {this.renderOption(InputMode.STRIKE)}
                </div>
            </div>
        );
    }
}

type StrategyListProps = {
    onClick: (strat: Strategy) => void;
    strategyFound: Map<string, boolean>;
};

class StrategyList extends React.Component<StrategyListProps> {
    renderStrategy(strat: Strategy, index: number) {
        let status: string;

        switch (this.props.strategyFound.get(strat[0])) {
            case undefined:
                status = "?";
                break;
            case false:
                status = "no";
                break;
            case true:
                status = "yes";
                break;
        }

        return (
            <div className="strategy-item" key={index}>
                <div className="strategy-number">
                    {index}
                </div>
                <div className={"strategy-name"}>
                    {strat[0]}
                </div>
                <div className={"strategy-status"}
                    onClick={() => this.props.onClick(strat)}
                >
                    {status}
                </div>
            </div>
        );
    }

    render() {
        return (
            <>
                Strategies
                <div className="strategy-list">
                    {STRATEGIES.map((strat, index) => this.renderStrategy(strat, index))}
                </div>
            </>
        );
    }
}


type GameState = {
    board: Board,
    selectedCells: Set<CellId>,
    inputMode: InputMode,
    focus?: Digit,
    result?: StrategyResult,
    strategyFound: Map<string, boolean>;
};

export default class Game extends React.Component<any, GameState> {
    constructor(props: any) {
        super(props);

        this.state = {
            board: new Board(),
            selectedCells: new Set(),
            inputMode: InputMode.DIGIT,
            strategyFound: new Map(),
        };
    }

    resetBoard() {
        this.setState({
            board: new Board(undefined, "002090300805000000100000000090060040000000058000000001070000200300500000000100000"),
            result: undefined,
        });
    }

    handleClickDigit(id: CellId) {
        const cell = this.state.board.cells[id];
        const digit = cell.digit!;
        const selectedCells = new Set<CellId>();

        if (!cell.given) {
            selectedCells.add(id);
        }

        this.setState({
            selectedCells: selectedCells,
            focus: digit !== this.state.focus ? digit : undefined,
        });
    }

    handleClickCell(id: CellId) {
        const selectedCells = new Set(this.state.selectedCells);
        let inputMode = this.state.inputMode;

        if (selectedCells.has(id)) {
            selectedCells.delete(id);
        } else {
            selectedCells.clear();
            selectedCells.add(id);
            inputMode = InputMode.DIGIT;
        }

        this.setState({
            selectedCells: selectedCells,
            focus: undefined,
            inputMode: inputMode,
        });
    }

    handleMouseMove(cellId: CellId) {
        const selectedCells = new Set(this.state.selectedCells);

        selectedCells.add(cellId);

        this.setState({
            selectedCells: selectedCells,
            inputMode: InputMode.NOTE
        });
    }

    handleKeyDown(event: React.KeyboardEvent) {
        if (event.key === "Backspace") {
            this.clearSelection();
        }


        const digit = parseDigit(event.key);
        if (digit === undefined) {
            return;
        }

        switch (this.state.inputMode) {
            case InputMode.DIGIT:
                this.inputDigit(digit);
                break;
            case InputMode.NOTE:
                // this.inputNote(digit, NoteType.BASIC);
                break;
            case InputMode.ACCENT:
                // this.inputNote(digit, NoteType.ACCENT);
                break;
            case InputMode.STRIKE:
                // this.inputNote(digit, NoteType.STRIKE);
                break;
        }
    }

    updateInputMode(inputMode: InputMode) {
        let newInputMode = inputMode;

        if (newInputMode === this.state.inputMode) {
            newInputMode = InputMode.DIGIT;
        }


        this.setState({
            inputMode: newInputMode,
        });
    }

    inputDigit(digit: Digit) {
        const board = new Board(this.state.board);
        const selectedCells = this.state.selectedCells;

        for (const id of selectedCells) {
            board.inputDigit(id, digit);
        }

        this.setState({
            board: board,
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

        this.setState({
            board: board,
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

    tryStrategy([name, func]: Strategy): boolean {
        const result = func(this.state.board);
        const strategyFound = this.state.strategyFound;

        if (result === undefined) {
            strategyFound.set(name, false);
            this.setState({ strategyFound });

            return false;
        }

        console.log(name, result);

        strategyFound.set(name, true);

        this.setState({
            result,
            strategyFound,
        });

        return true;
    }

    applyResult() {
        const board = new Board(this.state.board);
        const result = this.state.result;

        if (result === undefined) {
            return;
        }

        const solutions = result.solutions;
        if (solutions !== undefined) {
            for (const [id, digit] of solutions) {
                board.inputDigit(id, digit);
            }
        }

        const eliminations = result.eliminations;
        if (eliminations !== undefined) {
            for (const [id, digit] of eliminations) {
                // board.inputNote(id, digit, NoteType.ELIMINATED);
                board.cell(id).eliminateCandidate(digit);
            }
        }

        this.setState({
            board: board,
            result: undefined,
        });
    }

    takeStep() {
        if (this.state.result === undefined) {
            for (const strat of STRATEGIES) {
                if (this.tryStrategy(strat)) {
                    return;
                }
            }

            console.log("no strategy found");
        } else {
            this.applyResult();
            this.setState({
                strategyFound: new Map(),
            });

            

        }
    }

    render() {
        const status = "Sudoku";

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
                    onClick={(id) => this.handleClickCell(id)}
                    onClickDigit={(digit) => this.handleClickDigit(digit)}
                    onMouseMove={(id) => this.handleMouseMove(id)}
                />
                <div className="game-info">
                    <div>{status}</div>
                    <NoteSelector
                        inputMode={this.state.inputMode}
                        onClick={(inputMode) => this.updateInputMode(inputMode)}
                    />
                    <button onClick={() => this.resetBoard()}>reset</button>
                    {/* <button onClick={() => this.initializeNotes()}>Init Notes</button> */}
                    <button onClick={() => this.takeStep()}>step</button>
                    <StrategyList
                        onClick={(strat) => this.tryStrategy(strat)}
                        strategyFound={this.state.strategyFound}
                    />
                </div>
            </div>
        );
    }
}