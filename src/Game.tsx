import React from "react";
import { MouseEventHandler } from 'react';
import "./Game.css";
import { Board, BOXES, Cell, CellId, CELLS, Digit, NoteType, parseDigit } from './sudoku';



enum SelectionMode {
    SINGLE,
    MULTI,
    DESELECT,
}

enum InputMode {
    DIGIT,
    NOTE,
    ACCENT,
    STRIKE,
}



type CellProps = {
    cell: Cell,
    selected: boolean,
    restricted: boolean,
    onClick: MouseEventHandler,
    onMouseMove: MouseEventHandler,
}

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

        const given = cell.given ? " given" : "";
        const selected = this.props.selected ? " selected" : "";
        const restricted = this.props.restricted ? " restricted" : "";
        

        if (cell.digit !== undefined) {
            return (
                <div
                    className={`cell ${given} ${selected} ${restricted}`}
                    onClick={this.props.onClick}
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
    restrictedDigit?: Digit, 
    onClick: (id: CellId) => void,
    onMouseMove: (id: CellId) => void,
}

class Grid extends React.Component<GridProps> {
    renderCell(id: CellId) {
        const cell = this.props.cells.get(id)!;

        const selected = this.props.selectedCells.has(id) || (cell.digit !== undefined && cell.digit == this.props.restrictedDigit);

        return (
            <CellComponent
                key={id}
                cell={cell}
                selected={selected}
                restricted={cell.restricted(this.props.restrictedDigit)}
                onClick={() => this.props.onClick(id)}
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
}

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
        )

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
        )
    }
}

type GameState = {
    board: Board,
    selectedCells: Set<CellId>,
    selectionMode: SelectionMode,
    inputMode: InputMode,
    restrictedDigit?: Digit,
}

class Game extends React.Component<any, GameState> {
    constructor(props: any) {
        super(props);

        this.state = {
            board: new Board(),
            selectedCells: new Set(),
            selectionMode: SelectionMode.SINGLE,
            inputMode: InputMode.DIGIT,
        };
    }

    handleClick(id: CellId) {
        const cells = new Map(this.state.board.cells);
        const selectedCells = new Set(this.state.selectedCells);
        const selectionMode = this.state.selectionMode;

        let restrictedDigit = cells.get(id)?.digit;
        if (restrictedDigit === this.state.restrictedDigit) {
            restrictedDigit = undefined;
        }

        switch (selectionMode) {
            case SelectionMode.SINGLE:
                if (selectedCells.has(id) && selectedCells.size == 1) {
                    selectedCells.delete(id);
                } else {
                    selectedCells.clear();
                    selectedCells.add(id);
                }
                break;
            case SelectionMode.MULTI:
                if (!selectedCells.delete(id)) {
                    selectedCells.add(id);
                }
                break;
        }

        this.setState({
            selectedCells: selectedCells,
            restrictedDigit: restrictedDigit,
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
        })
    }

    inputDigit(digit: Digit) {
        const board = new Board(this.state.board);
        const selectedCells = this.state.selectedCells;

        for (const id of selectedCells) {
            board.inputDigit(id, digit);
        }

        board.reviseNotes();

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
        })
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
        })
    }

    render() {
        const cells = new Map(this.state.board.cells);
        const selectedCells = new Set(this.state.selectedCells);
        const highlightDigit = this.state.restrictedDigit;


        const status = "Sudoku";

        return (
            <div className="game"
                tabIndex={-1}
                onKeyDown={(event) => this.handleKeyDown(event)}
            >
                <div className="game-board">
                    <Grid
                        cells={cells}
                        selectedCells={selectedCells}
                        restrictedDigit={highlightDigit}
                        onClick={(id) => this.handleClick(id)}
                        onMouseMove={(id) => this.handleMouseMove(id)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <NoteSelector
                        inputMode={this.state.inputMode}
                        onClick={(inputMode) => this.updateInputMode(inputMode)}
                    />
                    <button onClick={() => this.setState({
                        board: new Board(undefined, "310004069000000200008005040000000005006000017807030000590700006600003050000100002"),
                    })}>reset</button>
                </div>
            </div>
        );
    }
}

export default Game;
