import { Type } from "typescript";

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

export function isSome<T>(item: T): boolean {
    return item !== undefined;
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


// subset generators ----------------------------------------------------------

type TupleSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Tuple<
    T,
    N extends TupleSize,
    A extends T[] = []
> = N extends A['length']
    ? A
    : Tuple<T, N, [...A, T]>;


function range(n: number): number[] {
    return [...Array(n).keys()];
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

export function triplesOf<T>(arr: T[]): [T, T, T][] {
    return tuplesOf(3, arr) as Tuple<T, 3>[];
}

export function quadsOf<T>(arr: T[]): [T, T, T, T][] {
    return tuplesOf(4, arr) as Tuple<T, 4>[];

}


// graph stuff ----------------------------------------------------------------

interface UnionFind<T, Find = T> {
    add(item: T): void;
    find(item: T): Find | undefined;
    union(x: T, y: T): void;
}

export class UnionFindGood<T> implements UnionFind<T> {
    name: Map<T, T>;
    rank: Map<T, number>;

    constructor(items: T[]) {
        this.name = new Map(items.map((item) => [item, item]));
        this.rank = new Map(items.map((item) => [item, 0]));
    }

    add(item: T) {
        this.name.set(item, item);
        this.rank.set(item, 0);
    }

    get components() {
        const components = new Array<T[]>;

        for (const item of this.name.keys()) {
            const component = components.find((c) => this.find(c[0]) == this.find(item));

            if (component !== undefined) {
                component.push(item);
            } else {
                components.push([item]);
            }
        }

        return components;
    }

    get componentNames() {
        const names = new Array<T>();

        for (const item of this.name.keys()) {
            const name = this.find(item);

            if (names.includes(name)) {
                continue;
            }

            names.push(name);
        }

        return names;
    }

    find(item: T): T {
        if (this.name.get(item) !== item) {
            this.name.set(item, this.find(this.name.get(item)!));
        }
        return this.name.get(item)!;
    }

    union(item1: T, item2: T) {
        let a = this.find(item1);
        let b = this.find(item2);

        if (a == b) {
            return;
        }

        if (this.rank.get(a)! < this.rank.get(b)!) {
            [a, b] = [b, a];
        }

        if (this.rank.get(a)! == this.rank.get(b)!) {
            this.rank.set(a, this.rank.get(a)! + 1);
        }

        this.name.set(b, a);
    }
}

class UnionFindBad<T> implements UnionFind<T> {
    name: Map<T, T>;

    constructor(items?: T[]) {
        this.name = new Map(items?.map((item) => [item, item]));
    }

    add(item: T) {
        this.name.set(item, item);
    }

    find(item: T): T {
        if (this.name.get(item) !== item) {
            this.name.set(item, this.find(this.name.get(item)!));
        }

        return this.name.get(item)!;
    }

    union(x: T, y: T) {
        x = this.find(x);
        y = this.find(y);

        if (x === y) {
            return;
        }

        this.name.set(y, x);
    }

    get componentRoots() {
        const roots = new Array<T>();

        for (const item of this.name.keys()) {
            const root = this.find(item);

            if (!roots.includes(root)) {
                roots.push(root);
            }
        }

        return roots;
    }
}

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

        if (xIndex === yIndex || xIndex === undefined || yIndex === undefined) {
            return;
        }

        const yPart = this.parts.splice(yIndex, 1)[0];

        this.find(x)?.push(...yPart);
    }
}

export class VertexData<V> {
    neighbors: V[];

    constructor() {
        this.neighbors = [];
    }
}

export class Graph<V> {
    private vertices: Map<V, VertexData<V>>;
    private componentUF: Partition<V>;

    constructor(edges?: [V, V][]) {
        this.vertices = new Map();
        this.componentUF = new Partition();

        edges?.forEach((e) => this.addEdge(...e));
    }

    hasVertex(vertex: V): boolean {
        return this.vertices.has(vertex);
    }

    addVertex(vertex: V) {
        if (this.hasVertex(vertex)) {
            return;
        }

        this.vertices.set(vertex, new VertexData);
        this.componentUF.add(vertex);
    }

    getNeighbors(vertex: V): V[] | undefined {
        return this.vertices.get(vertex)?.neighbors;
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