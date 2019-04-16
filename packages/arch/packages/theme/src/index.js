// @flow
export const fontFamily = `
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  Helvetica,
  Arial,
  sans-serif,
  "Apple Color Emoji",
  "Segoe UI Emoji",
  "Segoe UI Symbol"
`;
export const borderRadius = 6;
export const gridSize = 8;
export const fontSize = 16;

import colors from './colors';
export { shadows } from './shadows';

export { colors };

export const globalStyles = {
  body: {
    backgroundColor: colors.page,
    color: colors.text,
    fontFamily: fontFamily,
    fontSize,
    letterSpacing: '-0.005em',
    margin: 0,
    textDecorationSkip: 'ink',
    textRendering: 'optimizeLegibility',
    msOverflowStyle: '-ms-autohiding-scrollbar',
    MozFontFeatureSettings: "'liga' on",
    MozOsxFontSmoothing: 'grayscale',
    WebkitFontSmoothing: 'antialiased',
  },
  a: {
    color: colors.primary,
    textDecoration: 'none',
  },
  'a:hover': {
    textDecoration: 'underline',
  },
};
