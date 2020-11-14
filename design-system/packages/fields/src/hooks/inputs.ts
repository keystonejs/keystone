import { useTheme } from '@keystone-ui/core';

import type { ShapeType, SizeType, WidthType } from '../types';

// TODO: Move to theme.
export const widthMap = {
  small: 128,
  medium: 256,
  large: 512,
  full: '100%',
};

export type InputTokensProps = {
  /* Fixes the height at a specific value. Uses vertical centering instead of padding */
  isMultiline?: boolean;
  /* Changes the shape by controlling the border radius token */
  shape?: ShapeType;
  /* Sets the size of the input */
  size?: SizeType;
  /* Sets the width of the input (distinct from size) */
  width?: WidthType;
};

type InputStateTokens = {
  background?: string;
  borderColor?: string;
  foreground?: string;
  shadow?: string;
};
export type InputTokens = {
  borderRadius?: number | string;
  borderWidth?: number | string;
  fontSize?: number | string;
  lineHeight?: number | string;
  // width: number | string;
  height?: number | string;
  paddingX: number | string;
  paddingY: number | string;
  placeholder?: string;
  resize?: string;
  transition?: string;

  hover: InputStateTokens;
  focus: InputStateTokens;
  invalid: InputStateTokens;
  disabled: InputStateTokens;
} & InputStateTokens;

export const useInputTokens = ({
  size: sizeKey = 'medium',
  // width: widthKey = 'large',
  isMultiline = false,
  shape = 'square',
}: InputTokensProps): InputTokens => {
  const { animation, controlSizes, fields, radii, spacing, typography } = useTheme();

  // const width = widthMap[widthKey];
  const size = controlSizes[sizeKey];

  return {
    background: fields.inputBackground,
    borderColor: fields.inputBorderColor,
    borderRadius: shape === 'round' ? radii.full : fields.inputBorderRadius,
    borderWidth: fields.inputBorderWidth,
    fontSize: size.fontSize,
    foreground: fields.inputForeground,
    height: isMultiline ? undefined : size.height,
    lineHeight: isMultiline ? typography.leading.base : `${size.height}px`,
    paddingX: spacing.medium,
    paddingY: isMultiline ? spacing.small : 0,
    placeholder: fields.inputPlaceholder,
    shadow: fields.shadow,
    transition: `
      background-color ${animation.duration100},
      box-shadow ${animation.duration100},
      border-color ${animation.duration100}
    `,
    // width,
    hover: {
      background: fields.hover.inputBackground,
      borderColor: fields.hover.inputBorderColor,
      shadow: fields.hover.shadow,
      foreground: fields.hover.inputForeground,
    },
    focus: {
      background: fields.focus.inputBackground,
      borderColor: fields.focus.inputBorderColor,
      shadow: fields.focus.shadow,
      foreground: fields.focus.inputForeground,
    },
    invalid: {
      background: fields.invalid.inputBackground,
      borderColor: fields.invalid.inputBorderColor,
      shadow: fields.invalid.shadow,
      foreground: fields.invalid.inputForeground,
    },
    disabled: {
      background: fields.disabled.inputBackground,
      borderColor: fields.disabled.inputBorderColor,
      shadow: fields.disabled.shadow,
      foreground: fields.disabled.inputForeground,
    },
  } as const;
};

export type InputStylesProps = {
  invalid: boolean;
  tokens: InputTokens;
};

export function useInputStyles({ invalid, tokens }: InputStylesProps) {
  const styles = {
    appearance: 'none',
    backgroundColor: invalid ? tokens.invalid.background : tokens.background,
    borderColor: invalid ? tokens.invalid.borderColor : tokens.borderColor,
    borderRadius: tokens.borderRadius,
    borderStyle: 'solid',
    borderWidth: tokens.borderWidth,
    boxShadow: invalid ? tokens.invalid.shadow : tokens.shadow,
    boxSizing: 'border-box',
    color: invalid ? tokens.invalid.foreground : tokens.foreground,
    fontSize: tokens.fontSize,
    height: tokens.height,
    lineHeight: tokens.lineHeight,
    // maxWidth: tokens.width,
    outline: 0,
    paddingBottom: tokens.paddingY,
    paddingLeft: tokens.paddingX,
    paddingRight: tokens.paddingX,
    paddingTop: tokens.paddingY,
    resize: 'vertical', // applies to textarea
    transition: tokens.transition,
    width: '100%',

    ':hover': {
      backgroundColor: tokens.hover.background,
      borderColor: tokens.hover.borderColor,
      boxShadow: tokens.hover.shadow,
      color: tokens.hover.foreground,
    },
    ':focus': {
      backgroundColor: tokens.focus.background,
      borderColor: tokens.focus.borderColor,
      boxShadow: tokens.focus.shadow,
      color: tokens.focus.foreground,
    },
    ':disabled': {
      backgroundColor: tokens.disabled.background,
      borderColor: tokens.disabled.borderColor,
      boxShadow: tokens.disabled.shadow,
      color: tokens.disabled.foreground,
    },
    '&::placeholder': {
      color: tokens.placeholder,
    },
  } as const;

  return styles;
}
