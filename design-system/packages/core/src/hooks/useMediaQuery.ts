import facepaint from 'facepaint';

import { Theme } from '../types';
import { useTheme } from '../theme';

type BreakPoints = Theme['breakpoints'];
type BreakPoint = keyof BreakPoints;

/*
  Facepaint lets you write properties as arrays e.g.

  <div css={{ width: [200, 400] }} />

  More here: https://github.com/emotion-js/facepaint
*/
const makeMq = (breakpoints: BreakPoints) =>
  facepaint(Object.values(breakpoints).map(w => `@media (min-width: ${w}px)`));

// helper if array property declaration isn't appropriate
const makeMinBreak = (breakpoints: BreakPoints) => (key: BreakPoint) => {
  const width = breakpoints[key];
  return `@media (min-width: ${width}px)`;
};

// the breakpoints are designed to go up i.e. min-width
// if a max-width is necessary (hopefully rare) it's nice to provide a helper
const makeMaxBreak = (breakpoints: BreakPoints) => (key: BreakPoint) => {
  const width = breakpoints[key];
  return `@media (max-width: ${width - 1}px)`;
};

// FIXME:
// Should this even be a hook? I think we can just export these utilities...
export const useMediaQuery = () => {
  const { breakpoints } = useTheme();
  return {
    mq: makeMq(breakpoints),
    maxBreak: makeMaxBreak(breakpoints),
    minBreak: makeMinBreak(breakpoints),
  };
};
