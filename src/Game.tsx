import React from "react";
import { MouseEventHandler } from 'react';
import "./Game.css";
import { Board, BOXES, Cell, CellId, Digit, NoteType, parseDigit, STRATEGIES, Strategy, StrategyResult } from './sudoku';



enum InputMode {
    DIGIT,
    NOTE,
    ACCENT,
    STRIKE,
}



type CellProps = {
    cell: Cell,
    selected: boolean,
    focus?: Digit,
    onClick: MouseEventHandler,
    onClickDigit: MouseEventHandler,
    onMouseMove: MouseEventHandler,
};

class CellComponent extends React.Component<CellProps> {
    renderNote(digit: Digit) {
        const noteType = this.props.cell.notes.get(digit);

        return (
            <div
                className={`note ${noteType}`}
                key={digit}
            >
                {digit}
            </div>
        );
    }

    render() {
        const cell = this.props.cell;

        const selected = this.props.selected ? "selected" : "";
        const restricted = cell.restricts(this.props.focus) ? "restricted" : "";


        if (cell.hasDigit) {
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
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => this.renderNote(i as Digit))}
            </div>
        );
    }

}

type GridProps = {
    cells: Map<CellId, Cell>,
    selectedCells: Set<CellId>,
    focus?: Digit,
    onClick: (id: CellId) => void,
    onClickDigit: (cellId: CellId) => void,
    onMouseMove: (id: CellId) => void,
};

class Grid extends React.Component<GridProps> {
    renderCell(id: CellId) {
        return (
            <CellComponent
                key={id}
                cell={this.props.cells.get(id)!}
                selected={this.props.selectedCells.has(id)}
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
                className={`note-option ${this.props.inputMode == inputMode ? "selected" : ""}`}
                onClick={() => this.props.onClick(inputMode)}
            >
                {label}
            </div>
        );

    }

    render() {
        return (
            <div>
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
};

class StrategyList extends React.Component<StrategyListProps> {
    render() {
        return (
            <>
                {STRATEGIES.map((strat) =>
                    <button
                        key={strat.name}
                        onClick={() => this.props.onClick(strat)}
                    >
                        {strat.name}
                    </button>
                )}
            </>

        );
    }
}


type GameState = {
    board: Board,
    selectedCells: Set<CellId>,
    inputMode: InputMode,
    focus?: Digit,
};

export default class Game extends React.Component<any, GameState> {
    constructor(props: any) {
        super(props);

        this.state = {
            board: new Board(),
            selectedCells: new Set(),
            inputMode: InputMode.DIGIT,
        };
    }

    handleClickDigit(id: CellId) {
        const cell = this.state.board.cells.get(id)!;
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
                this.inputNote(digit, NoteType.BASIC);
                break;
            case InputMode.ACCENT:
                this.inputNote(digit, NoteType.ACCENT);
                break;
            case InputMode.STRIKE:
                this.inputNote(digit, NoteType.STRIKE);
                break;
        }
    }

    updateInputMode(inputMode: InputMode) {
        let newInputMode = inputMode;

        if (newInputMode == this.state.inputMode) {
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

    inputNote(digit: Digit, noteType: NoteType) {
        const board = new Board(this.state.board);
        const selectedCells = this.state.selectedCells;

        for (const id of selectedCells) {
            board.inputNote(id, digit, noteType);
        }

        this.setState({
            board: board,
            selectedCells: new Set(),
            inputMode: InputMode.DIGIT,
        });
    }

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

    initializeNotes() {
        const board = new Board(this.state.board);

        board.initializeNotes();

        this.setState({
            board: board,
        });
    }

    applyStrategy(strat: Strategy): boolean {
        const result = strat(this.state.board);

        if (result.applies) {
            console.log(strat.name, result);

            this.applyResult(result);

            return true;
        }


        return false;
    }

    applyResult(result: StrategyResult) {
        const board = new Board(this.state.board);

        const solutions = result.solutions;
        if (solutions !== undefined) {
            for (const [id, digit] of solutions) {
                board.inputDigit(id, digit);
            }
        }

        const eliminations = result.eliminations;
        if (eliminations !== undefined) {
            for (const [id, digit] of eliminations) {
                board.inputNote(id, digit, NoteType.ELIMINATED);
            }
        }


        this.setState({
            board: board
        });
    }

    takeStep() {
        for (const strategy of STRATEGIES) {
            if (this.applyStrategy(strategy)) {
                return;
            }
        }

        console.log("no strategy found");
    }

    render() {
        const cells = new Map(this.state.board.cells);
        const selectedCells = new Set(this.state.selectedCells);
        const focus = this.state.focus;


        const status = "Sudoku";

        return (
            <div className="game"
                tabIndex={-1}
                onKeyDown={(event) => this.handleKeyDown(event)}
            >
                <Grid
                    cells={cells}
                    selectedCells={selectedCells}
                    focus={focus}
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
                    <button onClick={() => this.setState({
                        board: new Board(undefined, "123000587005817239987000164051008473390750618708100925076000891530081746810070352"),
                    })}>reset</button>
                    <button onClick={() => this.initializeNotes()}>Init Notes</button>
                    <button onClick={() => this.takeStep()}>step</button>
                    <StrategyList onClick={(strat) => this.applyStrategy(strat)} />
                </div>
            </div>
        );
    }
}