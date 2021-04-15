import facepaint from 'facepaint';

type BREAKPOINTSTYPE = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
};

export const BREAK_POINTS: BREAKPOINTSTYPE = { xs: 576, sm: 768, md: 992, lg: 1200 };

const minWidth = (width: number, m: boolean = true) =>
  `${m ? '@media ' : ''}(min-width: ${width}px)`;

type MediaType = {
  [P in keyof BREAKPOINTSTYPE]: string;
};

export const media: MediaType = Object.entries(BREAK_POINTS).reduce(
  (obj, [key, value]) => ({ ...obj, [key]: minWidth(value) }),
  {} as Record<keyof MediaType, string>
);

/*
  Array Syntax for Breakpoints
  ------------------------------
  <div css={mq({
    fontSize: [14, 16],
    width: ['12rem', '24rem', '36rem', '48rem'],
  })} />
*/

export const mq = facepaint(Object.values(BREAK_POINTS).map(value => minWidth(value)));
