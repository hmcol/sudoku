import React from "react";
import "./Game.css";

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const COLUMNS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const SelectionMode = {
    SINGLE: 0,
    MULTI: 1,
}


function Cell(props) {
    const className = props.selected ? "cell selected" : "cell";

    return (
        <div className={className} onClick={props.onClick}>
            {props.value}
        </div>
    );
}

class Board extends React.Component {
    renderCell(i) {
        return (
            <Cell
                key={i}
                value={i}
                selected={this.props.selectedCells.has(i)}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        return (
            <div className="board">
                {[0, 3, 6].map((rowOffset) => [0, 3, 6].map((columnOffset) =>
                    <div className="box" key={columnOffset}>
                        {[0, 1, 2].map((r) => [0, 1, 2].map((c) =>
                            this.renderCell(ROWS[rowOffset + r] + COLUMNS[columnOffset + c])
                        ))}
                    </div>
                ))}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        const cells = {};

        for (const row of ROWS) {
            for (const column of COLUMNS) {
                cells[row + column] = null;
            }
        }

        window.cells = cells;

        this.state = {
            history: [{
                cells: cells,
            }],
            stepNumber: 0,
            selectedCells: new Set(),
        };
    }

    handleClick(cellId) {
        const selectedCells = new Set(this.state.selectedCells);

        if (!selectedCells.delete(cellId)) {
            selectedCells.add(cellId);
        }


        this.setState({
            selectedCells: selectedCells,
        });
    }

    handleKeyPress(event) {
        console.log(event.key);
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];

        const selectedCells = new Set(this.state.selectedCells);




        const status = "gummy bear";

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        cells={current.cells}
                        selectedCells={selectedCells}
                        onClick={(i) => this.handleClick(i)}
                        onKeyPress={(event) => this.handleKeyPress(event)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    {/* <div>{selectedCells}</div> */}
                    {/* <ol>{moves}</ol> */}
                </div>
            </div>
        );
    }
}

export default Game;

