import facepaint from 'facepaint';
import { breakpoints } from '../theme';

const bpEntries = Object.entries(breakpoints);
const maxWidth = (width, m = true) => `${m ? '@media ' : ''}(max-width: ${width}px)`;
const minWidth = (width, m = true) => `${m ? '@media ' : ''}(min-width: ${width}px)`;

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
    [size]: `${minWidth(min)} and ${maxWidth(max, false)}`,
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

export const mq = facepaint(Object.values(breakpoints).map(value => minWidth(value)));
