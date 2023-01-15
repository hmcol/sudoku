import { isNone } from "../combinatorics";

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function parseDigit(str: string): Digit | undefined {
    const num = parseInt(str);

    if (isNaN(num)) {
        return undefined;
    }

    if (![1, 2, 3, 4, 5, 6, 7, 8, 9].includes(num)) {
        return undefined;
    }

    return num as Digit;
}
