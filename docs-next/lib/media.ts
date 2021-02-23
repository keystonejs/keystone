import facepaint from 'facepaint';

type BREAKPOINTSTYPE = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
};

export const BREAK_POINTS: BREAKPOINTSTYPE = { xs: 576, sm: 768, md: 992, lg: 1200 };
const bpEntries: Array<[string, number]> = Object.entries(BREAK_POINTS);
const maxWidth = (width: number, m: boolean = true) =>
  `${m ? '@media ' : ''}(max-width: ${width}px)`;
const minWidth = (width: number, m: boolean = true) =>
  `${m ? '@media ' : ''}(min-width: ${width}px)`;

type MediaType = {
  [P in keyof BREAKPOINTSTYPE]: string;
};

// MIN-width queries (default)
export const media: MediaType = bpEntries.reduce(
  (obj, [key, value]) => ({ ...obj, [key]: minWidth(value) }),
  {} as Record<keyof MediaType, string>
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

export const mq = facepaint(Object.values(BREAK_POINTS).map(value => minWidth(value)));
