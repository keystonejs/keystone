import styled from 'react-emotion';

import { colors, gridSize } from '../theme';
import { alpha } from '../theme/color-utils';

const borderRadius = '0.3em';

export const buttonAndInputBase = {
  appearance: 'none',
  background: 'none',
  border: '1px solid transparent',
  borderRadius: borderRadius,
  fontSize: 14,
  lineHeight: '1.2em',
  padding: `${gridSize}px ${gridSize * 1.5}px`,
  transition: 'box-shadow 100ms linear',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

export const Input = styled.input({
  ...buttonAndInputBase,
  backgroundColor: 'white',
  borderColor: colors.N20,
  boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075)',
  color: 'inherit',
  width: '100%',

  ':hover': {
    borderColor: colors.N30,
    outline: 0,
  },
  ':focus': {
    borderColor: colors.primary,
    boxShadow: `inset 0 1px 1px rgba(0, 0, 0, 0.075),
      0 0 0 3px ${alpha(colors.primary, 0.2)}`,
    outline: 0,
  },
});
