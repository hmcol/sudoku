import React from "react";
import { MouseEventHandler } from 'react';
import "./Game.css";
import { Boxes, CellData, CellId, Column, Digit, NoteType, Row } from './sudoku';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const COLUMNS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

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


function noteTypeName(noteType?: NoteType) {
    switch (noteType) {
        case NoteType.BASIC:
            return "basic";
        case NoteType.ACCENT:
            return "accent";
        case NoteType.STRIKE:
            return "eliminated";
    }
}


type CellProps = {
    cellData: CellData,
    selected: boolean,
    onClick: MouseEventHandler,
    onMouseMove: MouseEventHandler,
}

class Cell extends React.Component<CellProps> {
    renderNote(digit: Digit) {
        const noteType = this.props.cellData.notes.get(digit);

        return (
            <div
                className={`note ${noteTypeName(noteType)}`}
                key={digit}
            >
                {noteType !== undefined ? digit : ""}
            </div>
        )
    }

    render() {
        const data = this.props.cellData;

        if (data.value) {
            return (
                <div
                    className={`cell ${this.props.selected ? "selected" : ""}`}
                    onClick={this.props.onClick}
                >
                    {data.value}
                </div>
            );
        }

        return (
            <div
                className={`cell notes ${this.props.selected ? "selected" : ""}`}
                onClick={this.props.onClick}
                onMouseMove={this.props.onMouseMove}
            >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => this.renderNote(i))}
            </div>
        );
    }

}

type BoardProps = {
    cells: Map<CellId, CellData>
    selectedCells: Set<CellId>,
    onClick: (id: CellId) => void,
    onMouseMove: (id: CellId) => void,
}

class Board extends React.Component<BoardProps> {
    renderCell(id: CellId) {
        const cell = this.props.cells.get(id)!;

        return (
            <Cell
                key={id}
                cellData={cell}
                selected={this.props.selectedCells.has(id)}
                onClick={() => this.props.onClick(id)}
                onMouseMove={(event) => event.buttons === 1 && this.props.onMouseMove(id)}
            />
        );
    }

    render() {
        const cells = Object.assign({}, this.props.cells);

        return (
            <div className="board">
                {[...Boxes.keys()].map((i) =>
                    <div className="box" key={i}>
                        {Boxes[i].map((id) => this.renderCell(id))}
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
    cells: Map<CellId, CellData>,
    selectedCells: Set<CellId>,
    selectionMode: SelectionMode,
    inputMode: InputMode,
}

class Game extends React.Component<any, GameState> {
    constructor(props: any) {
        super(props);

        const cells = new Map;
        ROWS.forEach((row) => COLUMNS.forEach((column) =>
            cells.set(row + column, new CellData)
        ));

        this.state = {
            cells: cells,
            selectedCells: new Set(),
            selectionMode: SelectionMode.SINGLE,
            inputMode: InputMode.DIGIT,
        };
    }

    handleClick(cellId: CellId) {
        const selectedCells = new Set(this.state.selectedCells);
        const selectionMode = this.state.selectionMode;
        let inputMode = this.state.inputMode;

        if (!selectedCells.delete(cellId)) {
            if (selectionMode == SelectionMode.SINGLE) {
                selectedCells.clear();
            }

            selectedCells.add(cellId);
            inputMode = InputMode.DIGIT;
        }

        this.setState({
            selectedCells: selectedCells,
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
        const digit = parseInt(event.key);

        if (isNaN(digit) || digit == 0) {
            return;
        }

        this.inputDigit(digit);
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
        const cells = new Map(this.state.cells);
        const selectedCells = new Set(this.state.selectedCells);

        for (const id of selectedCells) {
            let cellData = cells.get(id);

            if (cellData === undefined) {
                continue;
            }

            switch (this.state.inputMode) {
                case InputMode.DIGIT:
                    cellData.value = digit;
                    break;
                case InputMode.NOTE:
                    cellData.notes.set(digit, NoteType.BASIC);
                    break;
                case InputMode.ACCENT:
                    cellData.notes.set(digit, NoteType.ACCENT);
                    break;
                case InputMode.STRIKE:
                    cellData.notes.set(digit, NoteType.STRIKE);
                    break;
            }
        }

        this.setState({
            cells: cells,
            selectedCells: new Set,
        })
    }

    render() {
        const cells = new Map(this.state.cells);
        const selectedCells = new Set(this.state.selectedCells);


        const status = "Sudoku";

        return (
            <div className="game"
                tabIndex={-1}
                onKeyDown={(event) => this.handleKeyDown(event)}
            >
                <div className="game-board">
                    <Board
                        cells={cells}
                        selectedCells={selectedCells}
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
                </div>
            </div>
        );
    }
}

export default Game;
