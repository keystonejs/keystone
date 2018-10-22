// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

import { XIcon } from '../icons';
import { colors } from '../theme';

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

type ButtonProps = {
  /* Affects the visual style of the lozenge */
  appearance: 'default' | 'primary' | 'danger' | 'create' | 'warning',
  /* The value displayed within the lozenge. */
  variant: 'bold' | 'subtle',
};
type Props = ButtonProps & {
  children: Node,
  onClick: MouseEvent => void,
  onRemove: MouseEvent => void,
};

const PillWrapper = styled.div({ display: 'inline-flex' });
const PillButton = styled.button(({ appearance, variant }: Props) => {
  const fontSizeNumeric = 0.75;
  const fontSize = `${fontSizeNumeric}em`;
  const borderRadius = `${fontSizeNumeric * 2}em`;

  return {
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
    fontWeight: 500,
    lineHeight: '1.8em',
    justifyContent: 'center',
    maxWidth: '100%',
    minWidth: 1,
    outline: 0,
    whiteSpace: 'nowrap',

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

    ':first-child': {
      paddingLeft: '0.9em',
      paddingRight: '0.75em',
      borderTopLeftRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      marginRight: 1,
    },
    ':last-child': {
      paddingLeft: '0.75em',
      paddingRight: '0.9em',
      borderTopRightRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
      marginLeft: 1,
    },
  };
});

export const Pill = ({ appearance, children, onClick, onRemove, variant, ...props }: Props) => {
  return (
    <PillWrapper {...props}>
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
};
Pill.defaultProps = {
  appearance: 'default',
  variant: 'subtle',
};
