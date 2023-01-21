import { isNone } from "./option";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DefaultMap<K, V> extends Map<K, V> {
    constructor(private readonly defaultValue: V) {
        super();
    }

    get(key: K): V {
        let value = super.get(key);

        if (isNone(value)) {
            value = this.defaultValue;
            this.set(key, value);
        }

        return value;
    }
}

export class MultiMapArray<K, V> extends Map<K, V[]> {
    get(key: K): V[] {
        return super.get(key) ?? [];
    }

    add(key: K, value: V) {
        const values = this.get(key);

        values.push(value);

        this.set(key, values);
    }
}

export class MultiMapSet<K, V> extends Map<K, Set<V>> {
    get(key: K): Set<V> {
        return super.get(key) ?? new Set();
    }

    add(key: K, value: V) {
        const values = this.get(key);

        values.add(value);

        this.set(key, values);
    }

    concat(other: MultiMapSet<K, V>): MultiMapSet<K, V> {
        const mms = new MultiMapSet<K, V>();

        for (const [key, values] of [...this, ...other]) {
            for (const value of values) {
                mms.add(key, value);
            }
        }

        return mms;
    }
}
