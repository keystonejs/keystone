/** @jsx jsx */

import { useTheme } from '@keystone-ui/core';

export const buttonSizeValues = ['large', 'medium', 'small'] as const;
export const buttonToneValues = [
  'active',
  'passive',
  'positive',
  'warning',
  'negative',
  'help',
] as const;
export const buttonWeightValues = ['bold', 'light', 'none', 'link'] as const;

export type SizeKey = typeof buttonSizeValues[number];
export type ToneKey = typeof buttonToneValues[number];
export type WeightKey = typeof buttonWeightValues[number];

export type ButtonPropDefaults = {
  size: SizeKey;
  tone: ToneKey;
  weight: WeightKey;
};
export const buttonPropDefaults = {
  size: 'medium',
  tone: 'passive',
  weight: 'light',
} as const;

type ButtonTokensProps = {
  size: SizeKey;
  tone: ToneKey;
  weight: WeightKey;
};
type ButtonStateTokens = {
  background?: string;
  borderColor?: string;
  foreground?: string;
  shadow?: string;
  textDecoration?: string;
};
export type ButtonTokens = {
  borderRadius?: number;
  borderWidth?: number;
  disabledOpacity: number;
  fontSize?: number | string;
  fontWeight?: number;
  height?: number;
  paddingX?: number;
  transition?: string;
  focus: ButtonStateTokens;
  hover: ButtonStateTokens;
  pressed: ButtonStateTokens;
} & ButtonStateTokens;

type Weight = ButtonStateTokens & Pick<ButtonTokens, 'focus' | 'hover' | 'pressed'>;

export function useButtonTokens({
  tone: toneKey,
  size: sizeKey,
  weight: weightKey,
}: ButtonTokensProps): ButtonTokens {
  const { animation, colors, tones, typography, controlSizes, opacity } = useTheme();
  const tone = tones[toneKey];
  const size = controlSizes[sizeKey];

  const weights: { [key in WeightKey]: Weight } = {
    bold: {
      background: tone.fill[0],
      foreground: tone.fillForeground[0],
      focus: {
        shadow: `0 0 0 2px ${tone.focusRing}`,
      },
      hover: {
        background: tone.fill[1],
      },
      pressed: {
        background: tone.fill[2],
      },
    },
    light: {
      background: tone.tint[0],
      foreground: tone.foreground[0],
      focus: {
        shadow: `0 0 0 2px ${tone.focusRing}`,
      },
      hover: {
        foreground: tone.foreground[1],
        background: tone.tint[1],
      },
      pressed: {
        foreground: tone.foreground[2],
        background: tone.tint[2],
      },
    },
    none: {
      foreground: tone.foreground[0],
      focus: {
        shadow: `0 0 0 2px ${tone.focusRing}`,
      },
      hover: {
        foreground: tone.foreground[1],
        background: tone.tint[0],
      },
      pressed: {
        foreground: tone.foreground[2],
        background: tone.tint[1],
      },
    },
    link: {
      foreground: colors.foreground,
      textDecoration: 'none',

      focus: {
        textDecoration: 'underline',
      },
      hover: {
        foreground: tone.foreground[0],
        textDecoration: 'underline',
      },
      pressed: {
        foreground: tone.foreground[1],
        textDecoration: 'underline',
      },
    },
  };

  const weight = weights[weightKey];

  const tokens: ButtonTokens = {
    borderRadius: size.borderRadius,
    borderWidth: size.borderWidth,
    disabledOpacity: opacity.disabled,
    fontSize: size.fontSize,
    fontWeight: typography.fontWeight.medium,
    height: size.height,
    paddingX: size.paddingX,
    transition: `
      background-color ${animation.duration100},
      box-shadow ${animation.duration100},
      border-color ${animation.duration100},
      opacity ${animation.duration100},
    `,
    ...weight,
  };

  return tokens;
}

type ButtonStylesProps = {
  isDisabled?: boolean;
  isBlock?: boolean;
  tokens: ButtonTokens;
};

export function useButtonStyles({ isDisabled, isBlock, tokens }: ButtonStylesProps) {
  const baseStyles = {
    alignItems: 'center',
    borderStyle: 'solid',
    boxSizing: 'border-box',
    cursor: isDisabled ? 'default' : 'pointer',
    display: isBlock ? 'flex' : 'inline-flex',
    flexShrink: 0, // button text should NOT wrap, even within a flex container
    justifyContent: 'center',
    opacity: isDisabled ? tokens.disabledOpacity : undefined,
    outline: 0,
    pointerEvents: isDisabled ? 'none' : undefined, // the `disabled` attribute only works for the `button` element
    position: 'relative',
    textDecoration: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    width: isBlock ? '100%' : undefined,
  } as const;

  const tokenStyles = {
    backgroundColor: tokens.background || 'transparent',
    borderColor: tokens.borderColor || 'transparent',
    borderRadius: tokens.borderRadius,
    borderWidth: tokens.borderWidth,
    color: tokens.foreground,
    fontSize: tokens.fontSize,
    fontWeight: tokens.fontWeight,
    height: tokens.height,
    paddingLeft: tokens.paddingX,
    paddingRight: tokens.paddingX,
    textDecoration: tokens.textDecoration,
    transition: tokens.transition,

    ':focus': {
      background: tokens.focus.background,
      borderColor: tokens.focus.borderColor,
      boxShadow: tokens.focus.shadow,
      color: tokens.focus.foreground,
      textDecoration: tokens.focus.textDecoration,
    },
    ':hover': {
      background: tokens.hover.background,
      borderColor: tokens.hover.borderColor,
      boxShadow: tokens.hover.shadow,
      color: tokens.hover.foreground,
      textDecoration: tokens.hover.textDecoration,
    },
    ':active': {
      background: tokens.pressed.background,
      borderColor: tokens.pressed.borderColor,
      boxShadow: tokens.pressed.shadow,
      color: tokens.pressed.foreground,
      textDecoration: tokens.pressed.textDecoration,
    },
  };

  return { ...baseStyles, ...tokenStyles };
}
