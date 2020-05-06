import React, { memo } from 'react';
import styled from '@emotion/styled';

import { colors } from '@arch-ui/theme';

const boldBackgroundColor = {
  default: colors.N60,
  inverted: colors.text,
  primary: colors.primary,
  created: colors.create,
  warning: colors.warning,
  danger: colors.danger,
};
const boldTextColor = {
  default: 'white',
  inverted: 'white',
  primary: 'white',
  created: 'white',
  warning: 'white',
  danger: 'white',
};
const subtleBackgroundColor = {
  default: colors.N10,
  inverted: 'white',
  primary: colors.B.L85,
  created: colors.G.L85,
  warning: colors.Y.L85,
  danger: colors.R.L85,
};
const subtleTextColor = {
  default: colors.N70,
  inverted: colors.text,
  primary: colors.B.D20,
  created: colors.G.D20,
  warning: colors.Y.D20,
  danger: colors.R.D20,
};

const BadgeElement = styled.div(({ appearance, variant }) => ({
  backgroundColor:
    variant === 'bold' ? boldBackgroundColor[appearance] : subtleBackgroundColor[appearance],

  borderRadius: '2em',
  boxSizing: 'border-box',
  color: variant === 'bold' ? boldTextColor[appearance] : subtleTextColor[appearance],
  display: 'inline-block',
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1,
  minWidth: '2em',
  padding: '0.25em 0.5em',
  textAlign: 'center',
}));

export const Badge = memo(
  ({ appearance = 'default', max = 99, value = 0, variant = 'subtle', ...props }) => {
    const getValue = ({ value, max }) => {
      if (value < 0) return '0';
      if (max > 0 && value > max) return `${max}+`;
      return value;
    };

    return (
      <BadgeElement appearance={appearance} variant={variant} {...props}>
        {getValue({ value, max })}
      </BadgeElement>
    );
  }
);
