import styled from 'react-emotion';
import tinycolor from 'tinycolor2';
import { colors } from '../theme';

const borderRadius = '0.3em';

export const buttonAndInputBase = {
  appearance: 'none',
  background: 'none',
  border: '1px solid transparent',
  borderRadius: borderRadius,
  fontSize: 14,
  lineHeight: '1.2em',
  padding: '8px 12px',
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
  marginBottom: 8,
  width: '100%',

  ':hover': {
    borderColor: colors.N30,
    outline: 0,
  },
  ':focus': {
    borderColor: colors.primary,
    boxShadow: `inset 0 1px 1px rgba(0, 0, 0, 0.075),
      0 0 0 3px ${tinycolor(colors.primary)
        .setAlpha(0.2)
        .toRgbString()}`,
    outline: 0,
  },
});
