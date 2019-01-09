// @flow
import { borderRadius, gridSize } from '@arch-ui/theme';

export const buttonAndInputBase = {
  appearance: 'none',
  background: 'none',
  border: '1px solid transparent',
  borderRadius: borderRadius,
  boxSizing: 'border-box',
  fontSize: '0.9rem',
  lineHeight: '17px',
  margin: 0,
  padding: `${gridSize}px ${gridSize * 1.5}px`,
  transition: 'box-shadow 100ms linear',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

import * as mediaQueries from './media-queries';

export { mediaQueries };
