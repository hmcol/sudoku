export function pairsOf<T>(unit: T[]): [T, T][] {
    const len = unit.length;
    const pairs = new Array<[T, T]>();

    if (len < 2) {
        return [];
    }

    for (let i = 0; i < len - 1; i++) {
        for (let j = i + 1; j < len; j++) {
            pairs.push([unit[i], unit[j]]);
        }
    }

    return pairs;
}

export function triplesOf<T>(arr: T[]): [T, T, T][] {
    const len = arr.length;
    const triples = new Array<[T, T, T]>();

    if (len < 3) {
        return [];
    }

    for (let i = 0; i < len - 2; i++) {
        for (let j = i + 1; j < len - 1; j++) {
            for (let k = j + 1; k < len; k++) {
                triples.push([arr[i], arr[j], arr[k]]);
            }
        }
    }

    return triples;
}

export function quadsOf<T>(arr: T[]): [T, T, T, T][] {
    const len = arr.length;
    const quads = new Array<[T, T, T, T]>();

    if (len < 4) {
        return [];
    }

    for (let i = 0; i < len - 3; i++) {
        for (let j = i + 1; j < len - 2; j++) {
            for (let k = j + 1; k < len - 1; k++) {
                for (let l = k + 1; l < len; l++) {
                    quads.push([arr[i], arr[j], arr[k], arr[l]]);
                }
            }
        }
    }

    return quads;
}




export class UnionFind<T> {
    name: Map<T, T>;
    rank: Map<T, number>;

    constructor(items: T[]) {
        this.name = new Map(items.map((item) => [item, item]));
        this.rank = new Map(items.map((item) => [item, 0]));
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

export class Tree<T> {
    root: T;
    children: Map<T, T[]>;

    constructor(root: T) {
        this.root = root;
        this.children = new Map([[root, []]]);
    }

    addNode(node: T, parent: T) {
        const children = this.children.get(parent);

        if (children !== undefined) {
            children.push(node);
        }

        this.children.set(node, []);
    }

    hasNode(item: T): boolean {
        return this.children.has(item);
    }
}