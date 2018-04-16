import React, { Children } from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';
import tinycolor from 'tinycolor2';

import { colors } from '../theme';
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
  border: t(colors.danger).darken(8),
  text: 'white',
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
    border: t(colors.primary).darken(8),
    text: 'white',
  },
  create: {
    bg: colors.create,
    border: t(colors.create).darken(8),
    text: 'white',
  },
  reset: solidDangerConfig,
  delete: solidDangerConfig,
  danger: solidDangerConfig,
  warning: {
    bg: colors.warning,
    border: t(colors.warning).darken(8),
    text: 'white',
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

// maintain immutability
function t(c) {
  if (typeof c === 'string') {
    return tinycolor(c).clone();
  } else {
    return c.clone();
  }
}

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
  const bgTop = t(bg).brighten(8);
  const bgBottom = t(bg).darken(10);
  const borderTop = t(border).lighten(8);
  const borderBottom = t(border).darken(8);
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

    ':hover': {
      background: `linear-gradient(to bottom, ${t(bgTop).lighten(3)} 0%, ${t(
        bgBottom
      ).lighten(3)} 100%)`,
      boxShadow: '0 1px 0 rgba(0, 0, 0, 0.1)',
    },

    ':focus': {
      borderColor: focusRing,
      boxShadow: `0 0 0 3px ${t(focusRing || bg)
        .setAlpha(0.2)
        .toRgbString()}`,
    },

    ':active': {
      background: t(bgBottom).toString(),
      borderColor: `${t(border).darken(16)} ${t(border).darken(12)} ${t(
        border
      ).darken(8)}`,
      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.12)',
    },
  };
}

// ==============================
// Button Group
// ==============================

export const ButtonGroup = ({ children, growIndices = [], ...props }) => {
  const gutter = 4;
  return (
    <div
      css={{ display: 'flex', marginLeft: -gutter, marginRight: -gutter }}
      {...props}
    >
      {Children.map(children, (c, i) => (
        <div
          css={{
            flex: growIndices.includes(i) ? 1 : null,
            marginLeft: gutter,
            marginRight: gutter,
          }}
        >
          {c}
        </div>
      ))}
    </div>
  );
};
