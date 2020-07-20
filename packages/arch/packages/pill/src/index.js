/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { forwardRef } from 'react';

import { XIcon } from '@primer/octicons-react';
import { colors } from '@arch-ui/theme';
import { uniformHeight } from '@arch-ui/common';

const boldBackgroundColor = {
  default: { default: colors.N60, hover: colors.N50, active: colors.N70 },
  primary: {
    default: colors.primary,
    hover: colors.B.L10,
    active: colors.B.D10,
  },
  danger: { default: colors.danger, hover: colors.R.L10, active: colors.R.D10 },
  create: { default: colors.create, hover: colors.G.L10, active: colors.G.D10 },
  warning: {
    default: colors.warning,
    hover: colors.Y.L10,
    active: colors.Y.D10,
  },
};
const boldTextColor = {
  default: 'white',
  primary: 'white',
  danger: 'white',
  create: 'white',
  warning: 'white',
};

const subtleBackgroundColor = {
  default: { default: colors.N10, hover: colors.N15, active: colors.N20 },
  primary: { default: colors.B.L85, hover: colors.B.L80, active: colors.B.L75 },
  danger: { default: colors.R.L85, hover: colors.R.L80, active: colors.R.L75 },
  create: { default: colors.G.L85, hover: colors.G.L80, active: colors.G.L75 },
  warning: { default: colors.Y.L85, hover: colors.Y.L80, active: colors.Y.L75 },
};
const subtleTextColor = {
  default: colors.N50,
  primary: colors.primary,
  danger: colors.danger,
  create: colors.create,
  warning: colors.warning,
};

const PillWrapper = styled.div({ display: 'inline-flex' });
const PillButton = styled.button(({ appearance, variant }) => {
  const fontSizeNumeric = 0.85;
  const fontSize = `${fontSizeNumeric}rem`;
  const borderRadius = `${fontSizeNumeric * 2}rem`;

  return {
    ...uniformHeight,
    backgroundColor:
      variant === 'bold'
        ? boldBackgroundColor[appearance].default
        : subtleBackgroundColor[appearance].default,
    color: variant === 'bold' ? boldTextColor[appearance] : subtleTextColor[appearance],
    alignItems: 'center',
    border: 0,
    cursor: 'pointer',
    display: 'flex',
    fontSize: fontSize,
    justifyContent: 'center',
    maxWidth: '100%',
    minWidth: 1,
    outline: 0,

    ':hover,:focus': {
      backgroundColor:
        variant === 'bold'
          ? boldBackgroundColor[appearance].hover
          : subtleBackgroundColor[appearance].hover,
    },
    ':active': {
      backgroundColor:
        variant === 'bold'
          ? boldBackgroundColor[appearance].active
          : subtleBackgroundColor[appearance].active,
    },

    ':first-of-type': {
      paddingLeft: '0.9em',
      paddingRight: '0.75em',
      borderTopLeftRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      marginRight: 1,
    },
    ':last-of-type': {
      paddingLeft: '0.75em',
      paddingRight: '0.9em',
      borderTopRightRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
      marginLeft: 1,
    },
  };
});

export const Pill = forwardRef(
  ({ appearance = 'default', children, onClick, onRemove, variant = 'subtle', ...props }, ref) => {
    return (
      <PillWrapper {...props} ref={ref}>
        <PillButton appearance={appearance} variant={variant} onClick={onClick}>
          {children}
        </PillButton>
        {onRemove ? (
          <PillButton appearance={appearance} variant={variant} onClick={onRemove}>
            <XIcon css={{ height: 12 }} />
          </PillButton>
        ) : null}
      </PillWrapper>
    );
  }
);
