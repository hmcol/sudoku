import { BOXES, Board, CELLS, COLUMNS, Candidate, CellId, DIGITS, ROWS, newCandidate } from "../sudoku";
import { MultiMapSet } from "../util/MultiMap";
import { Cached } from "../util/cache";
import { pairsOf } from "../util/combinatorics";

export type LinkSet = MultiMapSet<Candidate, Candidate>;

export type LinkClass = keyof LinkCache;

export class LinkCache {
    private readonly bivalueInternal: Cached<LinkSet>;

    private readonly bilocalRowInternal: Cached<LinkSet>;
    private readonly bilocalColumnInternal: Cached<LinkSet>;
    private readonly bilocalBoxInternal: Cached<LinkSet>;
    private readonly bilocalInternal: Cached<LinkSet>;

    private readonly strongInternal: Cached<LinkSet>;


    private readonly weakCellInternal: Cached<LinkSet>;

    private readonly weakRowInternal: Cached<LinkSet>;
    private readonly weakColumnInternal: Cached<LinkSet>;
    private readonly weakBoxInternal: Cached<LinkSet>;
    private readonly weakUnitInternal: Cached<LinkSet>;

    private readonly weakInternal: Cached<LinkSet>;

    constructor(board: Board) {
        this.bivalueInternal = new Cached(() => {
            const links = new MultiMapSet<Candidate, Candidate>();

            const bivalueCells = CELLS.filter(cell =>
                board.cells[cell].numberOfCandidates === 2
            );

            for (const cell of bivalueCells) {
                const [a, b] = board.cells[cell].candidates
                    .map(digit => newCandidate(cell, digit));

                links.add(a, b);
                links.add(b, a);
            }

            return links;
        });

        const initBilocal = (unitType: CellId[][]) => {
            const links = new MultiMapSet<Candidate, Candidate>();

            for (const unit of unitType) {
                for (const x of DIGITS) {
                    const xCells = unit.filter(cell =>
                        board.cells[cell].hasCandidate(x)
                    );

                    if (xCells.length !== 2) {
                        continue;
                    }

                    const [a, b] = xCells.map(cell => newCandidate(cell, x));

                    links.add(a, b);
                    links.add(b, a);
                }
            }

            return links;
        };

        this.bilocalRowInternal = new Cached(() =>
            initBilocal(ROWS)
        );

        this.bilocalColumnInternal = new Cached(() =>
            initBilocal(COLUMNS)
        );

        this.bilocalBoxInternal = new Cached(() =>
            initBilocal(BOXES)
        );

        this.bilocalInternal = new Cached(() =>
            this.bilocalRow.concat(this.bilocalColumn).concat(this.bilocalBox)
        );

        this.strongInternal = new Cached(() =>
            this.bivalue.concat(this.bilocal)
        );


        this.weakCellInternal = new Cached(() => {
            const links = new MultiMapSet<Candidate, Candidate>();

            for (const cell of CELLS) {
                const cellCandidates = board.cells[cell].candidates
                    .map(digit => newCandidate(cell, digit));

                for (const [a, b] of pairsOf(cellCandidates)) {
                    links.add(a, b);
                    links.add(b, a);
                }
            }

            return links;
        });

        const initWeakLocal = (unitType: CellId[][]) => {
            const links = new MultiMapSet<Candidate, Candidate>();

            for (const unit of unitType) {
                for (const x of DIGITS) {
                    const xCandidates = unit
                        .filter(cell =>board.cells[cell].hasCandidate(x))
                        .map(cell => newCandidate(cell, x));

                    for (const [a, b] of pairsOf(xCandidates)) {
                        links.add(a, b);
                        links.add(b, a);
                    }
                }
            }

            return links;
        };

        this.weakRowInternal = new Cached(() =>
            initWeakLocal(ROWS)
        );

        this.weakColumnInternal = new Cached(() =>
            initWeakLocal(COLUMNS)
        );

        this.weakBoxInternal = new Cached(() =>
            initWeakLocal(BOXES)
        );

        this.weakUnitInternal = new Cached(() =>
            this.weakRow.concat(this.weakColumn).concat(this.weakBox)
        );

        this.weakInternal = new Cached(() =>
            this.weakCell.concat(this.weakUnit)
        );
    }

    get bivalue() {
        return this.bivalueInternal.value();
    }

    get bilocalRow() {
        return this.bilocalRowInternal.value();
    }

    get bilocalColumn() {
        return this.bilocalColumnInternal.value();
    }

    get bilocalBox() {
        return this.bilocalBoxInternal.value();
    }

    get bilocal() {
        return this.bilocalInternal.value();
    }

    get strong() {
        return this.strongInternal.value();
    }

    get weakCell() {
        return this.weakCellInternal.value();
    }

    get weakRow() {
        return this.weakRowInternal.value();
    }

    get weakColumn() {
        return this.weakColumnInternal.value();
    }

    get weakBox() {
        return this.weakBoxInternal.value();
    }

    get weakUnit() {
        return this.weakUnitInternal.value();
    }

    get weak() {
        return this.weakInternal.value();
    }
}

export function getLinks(links: LinkCache, linkClasses: LinkClass[]) {
    let newLinks = new MultiMapSet<Candidate, Candidate>();

    for (const linkClass of linkClasses) {
        newLinks = newLinks.concat(links[linkClass]);
    }

    return newLinks;
}