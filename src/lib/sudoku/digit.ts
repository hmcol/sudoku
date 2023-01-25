/**
 * a digit in a normal sudoku puzzle.
 */
export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * array containing all possible digits.
 */
export const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * tries to parse a digit from a string.
 *
 * @param str the string to parse.
 *
 * @returns the parsed digit or undefined.
 */
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
