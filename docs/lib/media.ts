import weakMemo from '@emotion/weak-memoize';
import facepaint from 'facepaint';

type BREAKPOINTSTYPE = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
};

export const BREAK_POINTS: BREAKPOINTSTYPE = { xs: 586, sm: 768, md: 992, lg: 1200 };

const minWidth = (width: number, m: boolean = true) =>
  `${m ? '@media ' : ''}(min-width: ${width}px)`;

type MediaType = {
  [P in keyof BREAKPOINTSTYPE]: string;
};

export const media: MediaType = Object.entries(BREAK_POINTS).reduce(
  (obj, [key, value]) => ({ ...obj, [key]: minWidth(value) }),
  {} as Record<keyof MediaType, string>
);

const paint = weakMemo(breakpoints =>
  facepaint(Object.entries(breakpoints).map(([, width]) => `@media (min-width: ${width}px)`))
);

export function useMediaQuery() {
  return paint(BREAK_POINTS);
}
