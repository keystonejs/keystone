import facepaint from 'facepaint';

export const BREAK_POINTS = { xs: 576, sm: 768, md: 992, lg: 1200 };
const bpEntries = Object.entries(BREAK_POINTS);
const maxWidth = width => `@media (max-width: ${width}px)`;
const minWidth = width => `@media (min-width: ${width}px)`;

// MIN-width queries (default)
export const media = bpEntries.reduce(
  (obj, [key, value]) => ({ ...obj, [key]: minWidth(value) }),
  {}
);

// MAX-width queries
export const mediaMax = bpEntries.reduce(
  (obj, [key, value]) => ({ ...obj, [key]: maxWidth(value - 1) }),
  {}
);

// ONLY-size queries
export const mediaOnly = bpEntries.reduce((obj, entry, idx) => {
  const nextEntry = bpEntries[idx + 1];

  if (!nextEntry) return obj;

  const min = entry[1];
  const [size, max] = nextEntry;

  return {
    ...obj,
    [size]: `@media (min-width: ${min}px) and (max-width: ${max}px)`,
  };
}, {});

/*
  Array Syntax for Breakpoints
  ------------------------------
  <div css={mq({
    fontSize: [14, 16],
    width: ['12rem', '24rem', '36rem', '48rem'],
  })} />
*/

export const mq = facepaint(Object.values(BREAK_POINTS).map(value => minWidth(value)));
