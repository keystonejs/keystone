import { colors } from '@arch-ui/theme';
import { alpha, darken } from '@arch-ui/color-utils';

const boldAppearance = {
  default: {
    bg: '#fff',
    border: colors.N20,
    focusRing: colors.primary,
    text: colors.text,
  },
  primary: {
    bg: colors.primary,
    border: colors.primary,
    focusRing: null,
    text: '#fff',
  },
  create: {
    bg: colors.create,
    border: colors.create,
    focusRing: null,
    text: '#fff',
  },
  danger: {
    bg: colors.danger,
    border: colors.danger,
    focusRing: null,
    text: '#fff',
  },
  warning: {
    bg: colors.warning,
    border: colors.warning,
    focusRing: null,
    text: '#fff',
  },
};
const ghostAppearance = {
  default: {
    border: colors.N20,
    text: colors.N60,
  },
  primary: {
    border: colors.B.L50,
    text: colors.primary,
  },
  create: {
    border: colors.G.L50,
    text: colors.create,
  },
  danger: {
    border: colors.R.L50,
    text: colors.danger,
  },
  warning: {
    border: colors.Y.L30,
    text: colors.warning,
  },
};
const subtleAppearance = {
  default: {
    text: colors.N40,
    textHover: colors.text,
  },
  primary: {
    text: colors.N40,
    textHover: colors.primary,
  },
  create: {
    text: null,
    textHover: null,
  },
  warning: {
    text: colors.N40,
    textHover: colors.danger,
  },
  danger: {
    text: colors.danger,
    textHover: colors.danger,
  },
};
const nuanceAppearance = {
  default: {
    text: colors.text,
  },
  primary: {
    text: colors.primary,
  },
  create: {
    text: null,
  },
  warning: {
    text: colors.danger,
  },
  danger: {
    text: colors.danger,
  },
};

export function makeSubtleVariant({ appearance }) {
  const { text, textHover } = subtleAppearance[appearance];

  return {
    color: text,
    fontWeight: null,

    ':hover, :focus': {
      color: textHover,
      textDecoration: 'underline',
    },
  };
}

export function makeNuanceVariant({ appearance, isDisabled }) {
  const { text } = nuanceAppearance[appearance];

  return {
    color: text,
    fontWeight: 'normal',

    ':hover, :focus': makeGhostVariant({ appearance, isDisabled }),
  };
}

// Ghost
// ------------------------------

export function makeGhostVariant({ appearance, isDisabled }) {
  const { border, text } = ghostAppearance[appearance];

  return {
    border: '1px solid',
    borderColor: border,
    color: text,
    fontWeight: 'normal',
    opacity: isDisabled ? 0.5 : null,

    ':hover, :focus': {
      backgroundColor: alpha(border, 0.1),
      borderColor: darken(border, 10),
    },
    ':active': {
      color: darken(text, 10),
      borderColor: darken(border, 20),
      backgroundColor: alpha(border, 0.2),
    },
  };
}

// Bold
// ------------------------------

export function makeBoldVariant({
  appearance,
  isDisabled,
  isActive,
  isHover,
  isFocus,
  isSelected,
}) {
  const { bg, border, focusRing, text } = boldAppearance[appearance];
  const activeBg = appearance === 'default' ? colors.N10 : darken(bg, 12);

  const hoverAndFocus =
    isHover || isFocus
      ? {
          borderColor: border,
          background: bg,
        }
      : null;
  const hoverStyles = isHover
    ? {
        ...hoverAndFocus,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.12)',
      }
    : null;
  const focusStyles =
    isFocus && !isDisabled
      ? {
          ...hoverAndFocus,
          borderColor: focusRing,
          boxShadow: `0 0 0 3px ${alpha(focusRing || bg, 0.2)}`,
        }
      : null;
  const activeStyles =
    isActive || isSelected
      ? {
          background: activeBg,
          borderColor: border,
        }
      : null;

  return {
    backgroundColor: bg,
    backgroundRepeat: 'repeat-x',
    borderColor: border,
    color: text,
    fontWeight: 'bold',

    ...hoverStyles,
    ...focusStyles,
    ...activeStyles,
  };
}
