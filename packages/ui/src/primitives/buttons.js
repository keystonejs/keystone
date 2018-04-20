// @flow

import React from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';

import { colors } from '../theme';
import { alpha, darken, lighten, mix } from '../theme/color-utils';
import { buttonAndInputBase } from './forms';

const ButtonElement = props => {
  if (props.to) return <Link {...props} />;
  if (props.href) return <a {...props} />;
  return <button type="button" {...props} />;
};

const linkAppearance = {
  default: {
    text: colors.primary,
    textHover: colors.primary,
  },
  text: {
    text: colors.text,
    textHover: colors.primary,
  },
  subtle: {
    text: colors.N40,
    textHover: colors.primary,
  },
  reset: {
    text: colors.N40,
    textHover: colors.danger,
  },
  delete: {
    text: colors.danger,
    textHover: colors.danger,
    isSolidOnHover: true,
  },
};
const solidDangerConfig = {
  bg: colors.danger,
  border: darken(colors.danger, 8),
  text: mix(colors.danger, '#fff', 90),
};
const solidAppearance = {
  default: {
    bg: colors.N05,
    border: colors.N20,
    focusRing: colors.primary,
    text: colors.text,
  },
  primary: {
    bg: colors.primary,
    border: darken(colors.primary, 8),
    text: mix(colors.primary, '#fff', 90),
  },
  create: {
    bg: colors.create,
    border: darken(colors.create, 8),
    text: mix(colors.create, '#fff', 90),
  },
  reset: solidDangerConfig,
  delete: solidDangerConfig,
  danger: solidDangerConfig,
  warning: {
    bg: colors.warning,
    border: darken(colors.warning, 8),
    text: mix(colors.warning, '#fff', 90),
  },
};

export const Button = styled(ButtonElement)(
  ({ appearance, isDisabled, variant }) => {
    const variantStyles =
      variant === 'link'
        ? makeLinkVariant(appearance)
        : makeSolidVariant(appearance);

    return {
      ...buttonAndInputBase,
      cursor: isDisabled ? 'default' : 'pointer',
      display: 'inline-block',
      lineHeight: '1.2em',
      textAlign: 'center',
      touchAction: 'manipulation', // Disables "double-tap to zoom" for mobile; removes delay on click events
      userSelect: 'none',

      '&:hover': {
        backgroundRepeat: 'repeat-x',
        textDecoration: 'none',
      },

      '&:focus': {
        outline: 0,
      },

      // apply appearance styles
      ...variantStyles,
    };
  }
);
Button.defaultProps = {
  appearance: 'default',
  variant: 'solid',
};

function makeLinkVariant(appearance) {
  const { text, textHover, isSolidOnHover } = linkAppearance[appearance];

  return {
    color: text,

    ':hover, :focus': isSolidOnHover
      ? makeSolidVariant(appearance)
      : {
          color: textHover,
          textDecoration: 'underline',
        },
  };
}
function makeSolidVariant(appearance) {
  const { bg, border, focusRing, text } = solidAppearance[appearance];
  const bgTop = lighten(bg, 8);
  const bgBottom = darken(bg, 8);
  const borderTop = lighten(border, 8);
  const borderBottom = darken(border, 12);
  const activeBg = darken(bg, 12);
  const textShadow =
    appearance === 'default'
      ? '0 1px 0 rgba(255, 255, 255, 0.5)'
      : '0 -1px 0 rgba(0, 0, 0, 0.25)';

  return {
    background: `linear-gradient(to bottom, ${bgTop} 0%, ${bgBottom} 100%)`,
    borderColor: `${borderTop} ${border} ${borderBottom}`,
    color: text,
    fontWeight: 500,
    textShadow,

    ':hover, :focus': {
      background: `linear-gradient(to bottom, ${lighten(
        bgTop,
        6
      )} 0%, ${lighten(bgBottom, 6)} 100%)`,
    },
    ':hover': {
      boxShadow: '0 1px 0 rgba(0, 0, 0, 0.1)',
    },
    ':focus': {
      borderColor: focusRing,
      boxShadow: `0 0 0 3px ${alpha(focusRing || bg, 0.2)}`,
    },
    ':active': {
      background: activeBg,
      borderColor: `${darken(border, 24)} ${darken(border, 16)} ${darken(
        border,
        12
      )}`,
      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.12)',
    },
  };
}
