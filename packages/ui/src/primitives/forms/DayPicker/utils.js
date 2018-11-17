// @flow

export const yearRange = (from: number, to: number) => {
  const years: Array<number> = [];
  let year = from;
  while (year <= to) {
    years.push(year++);
  }
  return years;
};

export const months: Array<number> = Array.from({ length: 12 }, (_, i) => i);
