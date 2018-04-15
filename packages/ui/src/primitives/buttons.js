import React from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';
import tinycolor from 'tinycolor2';
import { colors } from '../theme';

const ButtonElement = props => {
  if (props.to) return <Link {...props} />;
  if (props.href) return <a {...props} />;
  return <button type="button" {...props} />;
};

const borderRadius = '0.25em';
const appearanceVariants = {
  default: { bg: '#eee', border: '#ccc', text: '#333' },
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
  delete: {
    bg: colors.delete,
    border: t(colors.delete).darken(8),
    text: 'white',
  },
  warning: {
    bg: colors.warning,
    border: t(colors.warning).darken(8),
    text: 'white',
  },
};

export const Button = styled(ButtonElement)(props => {
  const appearanceObj = appearanceVariants[props.appearance];
  const focusColor = props.appearance === 'default' ? colors.primary : null;
  const variant = makeButtonVariant(appearanceObj, focusColor);

  return {
    appearance: 'none',
    background: 'none',
    border: '1px solid transparent',
    borderRadius: borderRadius,
    cursor: props.isDisabled ? 'default' : 'pointer',
    display: 'inline-block',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '1.2em',
    padding: '8px 12px',
    textAlign: 'center',
    touchAction: 'manipulation', // Disables "double-tap to zoom" on mobile; removes delay of click events
    userSelect: 'none',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',

    '&:hover': {
      backgroundRepeat: 'repeat-x',
      textDecoration: 'none',
    },

    '&:focus': {
      outline: 0,
    },

    // apply appearance styles
    ...variant,
  };
});
Button.defaultProps = {
  appearance: 'default',
};

// maintain immutability
function t(c) {
  if (typeof c === 'string') {
    return tinycolor(c).clone();
  } else {
    return c.clone();
  }
}

function makeButtonVariant({ bg, border, text }, focusColor) {
  const bgTop = t(bg).brighten(8);
  const bgBottom = t(bg).darken(10);
  const borderTop = t(border).lighten(8);
  const borderBottom = t(border).darken(8);

  return {
    background: `linear-gradient(to bottom, ${bgTop} 0%, ${bgBottom} 100%)`,
    borderColor: `${borderTop} ${border} ${borderBottom}`,
    color: text,

    ':hover': {
      background: `linear-gradient(to bottom, ${t(bgTop).lighten(3)} 0%, ${t(
        bgBottom
      ).lighten(3)} 100%)`,
      boxShadow: '0 1px 0 rgba(0, 0, 0, 0.1)',
    },

    ':focus': {
      borderColor: focusColor,
      boxShadow: `0 0 0 3px ${t(focusColor || bg)
        .setAlpha(0.2)
        .toRgbString()}`,
    },

    ':active': {
      background: t(bgBottom).toString(),
      borderColor: `${t(border).darken(12)} ${t(border).darken(9)} ${t(
        border
      ).darken(6)}`,
      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.12)',
    },
  };
}
