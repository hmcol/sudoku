import React from "react";
import "./Game.css";

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const COLUMNS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const SelectionMode = {
    SINGLE: 0,
    MULTI: 1,
    DESELECT: 2,
}

const InputMode = {
    DIGIT: 0,
    NOTE: 1,
    ACCENT: 2,
    ELIMINATE: 3,
}

const NoteType = {
    BASIC: 1,
    ACCENT: 2,
    ELIMINATED: 3,
}

function noteTypeName(noteType) {
    switch (noteType) {
        case NoteType.BASIC:
            return "basic";
        case NoteType.ACCENT:
            return "accent";
        case NoteType.ELIMINATED:
            return "eliminated";
    }
}



class Cell extends React.Component {
    renderNote(digit) {
        const noteType = this.props.notes[digit];

        return (
            <div
                className={`note ${noteTypeName(noteType)}`}
                key={digit}
            >
                {noteType ? digit : ""}
            </div>
        )
    }

    render() {
        if (this.props.value) {
            return (
                <div
                    className={`cell ${this.props.selected ? "selected" : ""}`}
                    onClick={this.props.onClick}
                >
                    {this.props.value}
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


class Board extends React.Component {
    renderCell(id, cell) {
        return (
            <Cell
                key={id}
                value={cell.value}
                given={cell.given}
                notes={cell.notes}
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
                {[0, 3, 6].map((rowOffset) => [0, 3, 6].map((columnOffset) =>
                    <div className="box" key={columnOffset}>
                        {[0, 1, 2].map((r) => [0, 1, 2].map((c) => {
                            const id = ROWS[rowOffset + r] + COLUMNS[columnOffset + c];
                            return this.renderCell(id, cells[id]);
                        }
                        ))}
                    </div>
                ))}
            </div>
        );
    }
}

class NoteSelector extends React.Component {
    renderOption(inputMode) {
        let label;

        switch (inputMode) {
            case InputMode.NOTE:
                label = "N";
                break;
            case InputMode.ACCENT:
                label = "A";
                break;
            case InputMode.ELIMINATE:
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
                    {this.renderOption(InputMode.ELIMINATE)}
                </div>
            </div>
        )
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        const cells = {};
        ROWS.forEach((row) => COLUMNS.forEach((column) =>
            cells[row + column] = {
                value: null,
                given: false,
                notes: Array(10).fill(null),
            }
        ));

        this.state = {
            history: [{
                cells: cells,
            }],
            stepNumber: 0,
            selectedCells: new Set(),
            selectionMode: SelectionMode.SINGLE,
            inputMode: InputMode.DIGIT,
        };
    }

    handleClick(cellId) {
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

    handleMouseMove(cellId) {
        const selectedCells = new Set(this.state.selectedCells);

        selectedCells.add(cellId);

        this.setState({
            selectedCells: selectedCells,
            inputMode: InputMode.NOTE
        });
    }

    handleKeyDown(event) {
        const digit = parseInt(event.key);

        if (isNaN(digit) || digit == 0) {
            return;
        }

        this.inputDigit(digit);
    }

    updateInputMode(inputMode) {
        let newInputMode = inputMode;

        if (newInputMode == this.state.inputMode) {
            newInputMode = InputMode.DIGIT;
        }


        this.setState({
            inputMode: newInputMode,
        })
    }

    inputDigit(digit) {
        const history = this.state.history.slice();
        const cells = history[history.length - 1].cells;
        const selectedCells = new Set(this.state.selectedCells);

        for (const id of selectedCells) {
            switch (this.state.inputMode) {
                case InputMode.DIGIT:
                    cells[id].value = digit;
                    break;
                case InputMode.NOTE:
                    cells[id].notes[digit] = NoteType.BASIC;
                    break;
                case InputMode.ACCENT:
                    cells[id].notes[digit] = NoteType.ACCENT;
                    break;
                case InputMode.ELIMINATE:
                    cells[id].notes[digit] = NoteType.ELIMINATED;
                    break;
            }
        }

        this.setState({
            history: history,
            selectedCells: new Set(),
        })
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];

        const selectedCells = new Set(this.state.selectedCells);




        const status = "Sudoku";

        return (
            <div className="game"
                tabIndex={-1}
                onKeyDown={(event) => this.handleKeyDown(event)}
            >
                <div className="game-board">
                    <Board
                        cells={current.cells}
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
