/** @jsx jsx */

import { useTheme } from '@keystone-ui/core';
import type { ButtonTokens, WeightKey, ToneKey, SizeKey } from '@keystone-ui/button';

type ButtonTokensProps = {
  size: SizeKey;
  tone: ToneKey;
  weight: WeightKey;
};

type Weight = Omit<
  ButtonTokens,
  | 'disabledOpacity'
  | 'borderRadius'
  | 'borderWidth'
  | 'fontSize'
  | 'fontWeight'
  | 'height'
  | 'paddingX'
  | 'transition'
>;

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
      background: 'white',
      borderColor: tone.border[0],
      foreground: colors.foreground,
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
    light: {
      background: tone.tint[0],
      foreground: colors.foreground,
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
      foreground: colors.foreground,
      focus: {
        shadow: `0 0 0 2px ${tone.focusRing}`,
      },
      hover: {
        foreground: tone.foreground[0],
        background: tone.tint[0],
      },
      pressed: {
        foreground: tone.foreground[1],
        background: tone.tint[1],
      },
    },
    link: {
      foreground: colors.foreground,
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
    fontWeight: typography.fontWeight.semibold,
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
