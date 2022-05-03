export const toLabel = (str: string) => str.slice(0, 1).toUpperCase() + str.slice(1);

const VOWELS = ['a', 'e', 'i', 'o', 'u'];
export const aAn = (before: string) => `a${VOWELS.includes(before.charAt(0)) ? 'n' : ''}`;
