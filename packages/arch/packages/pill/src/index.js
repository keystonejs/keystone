// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { forwardRef, type Node } from 'react';

import { XIcon } from '@arch-ui/icons';
import { colors } from '@arch-ui/theme';

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

const shade = alpha => `rgba(9, 30, 66, ${alpha})`;

const subtleBackgroundColor = {
  default: { default: shade(0.04), hover: shade(0.08), active: shade(0.12) },
  primary: { default: colors.B.L90, hover: colors.B.L85, active: colors.B.L80 },
  danger: { default: colors.R.L90, hover: colors.R.L85, active: colors.R.L80 },
  create: { default: colors.G.L90, hover: colors.G.L85, active: colors.G.L80 },
  warning: { default: colors.Y.L90, hover: colors.Y.L85, active: colors.Y.L80 },
};
const subtleTextColor = {
  default: colors.N60,
  primary: colors.primary,
  danger: colors.danger,
  create: colors.create,
  warning: colors.warning,
};

type Variant = 'bold' | 'subtle';
type Appearance = 'default' | 'primary' | 'danger' | 'create' | 'warning';

type ButtonProps = {
  /* Affects the visual style of the lozenge */
  appearance?: Appearance,
  /* The value displayed within the lozenge. */
  variant?: Variant,
};
type Props = ButtonProps & {
  children: Node,
  onClick: MouseEvent => void,
  onRemove: MouseEvent => void,
};

const PillWrapper = styled.div({ display: 'inline-flex' });
const PillButton = styled.button(
  ({ appearance, nuanced, variant }: { appearance: Appearance, variant: Variant }) => {
    const fontSizeNumeric = 0.85;
    const fontSize = `${fontSizeNumeric}rem`;
    const borderRadius = '1.9em';

    return {
      backgroundColor: nuanced
        ? 'transparent'
        : variant === 'bold'
        ? boldBackgroundColor[appearance].default
        : subtleBackgroundColor[appearance].default,
      color: variant === 'bold' ? boldTextColor[appearance] : subtleTextColor[appearance],
      alignItems: 'center',
      border: 0,
      cursor: 'pointer',
      display: 'flex',
      fontSize: fontSize,
      // fontWeight: 500,
      lineHeight: '2rem',
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

      ':first-of-type': {
        paddingLeft: '1.1em',
        paddingRight: '0.85em',
        borderTopLeftRadius: borderRadius,
        borderBottomLeftRadius: borderRadius,
      },
      ':last-of-type': {
        paddingLeft: '0.85em',
        paddingRight: '1.1em',
        borderTopRightRadius: borderRadius,
        borderBottomRightRadius: borderRadius,
        marginLeft: 1,
      },
      ':only-of-type': {
        paddingLeft: '1.1em',
        paddingRight: '1.1em',
        margin: 0,
      },
    };
  }
);

export const Pill = forwardRef<Props, HTMLDivElement>(
  (
    {
      appearance = 'default',
      children,
      onClick,
      onRemove,
      nuanced,
      variant = 'subtle',
      ...props
    }: Props,
    ref
  ) => {
    const common = { appearance, nuanced, variant };
    return (
      <PillWrapper {...props} ref={ref}>
        <PillButton {...common} onClick={onClick}>
          {children}
        </PillButton>
        {onRemove ? (
          <PillButton {...common} onClick={onRemove}>
            <XIcon css={{ height: 12 }} />
          </PillButton>
        ) : null}
      </PillWrapper>
    );
  }
);
