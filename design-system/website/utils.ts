export const toLabel = (str: string) => str.substr(0, 1).toUpperCase() + str.substr(1);

const VOWELS = ['a', 'e', 'i', 'o', 'u'];
export const aAn = (before: string) => `a${VOWELS.includes(before.charAt(0)) ? 'n' : ''}`;
