export type Option<T> = T | undefined;

export function isSome<T>(item: Option<T>): item is T {
    return item !== undefined;
}

export function isNone<T>(item: Option<T>): item is undefined {
    return item === undefined;
}
