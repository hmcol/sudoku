import { Option, isNone } from "./option";

export class Cached<T> {
    private cache: Option<T>;

    constructor(private readonly init: () => T) {}

    value(): T {
        if (isNone(this.cache)) {
            this.cache = this.init();
        }

        return this.cache;
    }
}
