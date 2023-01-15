
// iterator helpers and set operations ----------------------------------------

export function In<T>(arr: T[]): (item: T) => boolean {
    return (item: T) => arr.includes(item);
}

export function notIn<T>(arr: T[]): (item: T) => boolean {
    return (item: T) => !arr.includes(item);
}

export function contains<T>(item: T): (arr: T[]) => boolean {
    return (arr: T[]) => arr.includes(item);
}

export function isSubset<T>(arr1: T[], arr2: T[]): boolean {
    return arr1.every((item) => arr2.includes(item));
}

export function hasSubset<T>(arr: T[]): (item: T[]) => boolean {
    return (item: T[]) => isSubset(arr, item);
}

export function isSome<T>(item: T | undefined): item is T {
    return item !== undefined;
}

export function isNone<T>(item: T | undefined): item is undefined {
    return item === undefined;
}

export function isEqual<T>(value: T): (item: T) => boolean {
    return (item) => item === value;
}

export function notEqual<T>(value: T): (item: T) => boolean {
    return (item) => item !== value;
}

export function intersection<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter(In(arr2));
}

// iterators

type TupleSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Tuple<
    T,
    N extends TupleSize,
    A extends T[] = []
> = N extends A["length"] ?
    A :
    Tuple<T, N, [...A, T]>;

export function range(n: number): number[] {
    return [...Array(n).keys()];
}

export function iterProduct<A, B>(aIter: Iterable<A>, bIter: Iterable<B>): [A, B][] {
    const product = new Array<[A, B]>();

    for (const a of aIter) {
        for (const b of bIter) {
            product.push([a, b]);
        }
    }

    return product;
}

export function iterProduct3<A, B, C>(aIter: Iterable<A>, bIter: Iterable<B>, cIter: Iterable<C>): [A, B, C][] {
    const product = new Array<[A, B, C]>();

    for (const a of aIter) {
        for (const bc of iterProduct(bIter, cIter)) {
            product.push([a, ...bc]);
        }
    }

    return product;
}

function orderedChoose(n: number, k: number): number[][] {
    if (k === 1) {
        return range(n).map(i => [i]);
    }

    if (k === n) {
        return [range(n)];
    }

    return orderedChoose(n - 1, k).concat(
        orderedChoose(n - 1, k - 1).map(s => s.concat([n - 1]))
    );
}

export function tuplesOf<T>(n: number, arr: T[]): T[][] {
    if (n > arr.length) {
        return [];
    }

    return orderedChoose(arr.length, n)
        .map(index => index.map(i => arr[i]));
}

export function pairsOf<T>(arr: T[]): Tuple<T, 2>[] {
    return tuplesOf(2, arr) as Tuple<T, 2>[];
}

export function triplesOf<T>(arr: T[]): Tuple<T, 3>[] {
    return tuplesOf(3, arr) as Tuple<T, 3>[];
}

export function quadsOf<T>(arr: T[]): Tuple<T, 4>[] {
    return tuplesOf(4, arr) as Tuple<T, 4>[];

}


// graph stuff ----------------------------------------------------------------

class Partition<T> {
    parts: T[][];

    constructor(items?: T[]) {
        this.parts = items?.map((item) => [item]) ?? [];
    }

    add(item: T) {
        this.parts.push([item]);
    }

    find(item: T): T[] | undefined {
        return this.parts.find(contains(item));
    }

    findIndex(item: T): number | undefined {
        return this.parts.findIndex(contains(item));
    }

    union(x: T, y: T) {
        const xIndex = this.findIndex(x);
        const yIndex = this.findIndex(y);

        if (xIndex === yIndex || isNone(xIndex) || isNone(yIndex)) {
            return;
        }

        const yPart = this.parts.splice(yIndex, 1)[0];

        this.find(x)?.push(...yPart);
    }
}

export class Graph<V> {
    private neighbors: Map<V, V[]>;
    private componentUF: Partition<V>;

    constructor(edges?: [V, V][]) {
        this.neighbors = new Map();
        this.componentUF = new Partition();

        edges?.forEach((e) => this.addEdge(...e));
    }

    hasVertex(vertex: V): boolean {
        return this.neighbors.has(vertex);
    }

    addVertex(vertex: V) {
        if (this.hasVertex(vertex)) {
            return;
        }

        this.neighbors.set(vertex, []);
        this.componentUF.add(vertex);
    }

    getNeighbors(vertex: V): V[] | undefined {
        return this.neighbors.get(vertex);
    }

    hasEdge(u: V, v: V): boolean {
        return this.getNeighbors(u)?.includes(v) ?? false;
    }

    addEdge(u: V, v: V) {
        if (this.hasEdge(u, v)) {
            return;
        }

        this.addVertex(u);
        this.addVertex(v);

        this.getNeighbors(u)?.push(v);
        this.getNeighbors(v)?.push(u);

        this.componentUF.union(u, v);
    }

    get components() {
        return this.componentUF.parts;
    }
}