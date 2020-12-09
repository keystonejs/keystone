import { CSSObject } from '@emotion/react';
import { identityType } from '../utils';
import { palette as basePalette } from './colors';

/**
 * Global Tokens
 */

const typography = {
  fontFamily: {
    monospace: 'Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    body:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    heading:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  },
  fontSize: {
    xxxsmall: '0.5rem',
    xxsmall: '0.6rem',
    xsmall: '0.75rem',
    small: '0.875rem',
    medium: '1rem',
    large: '1.125rem',
    xlarge: '1.25rem',
    xxlarge: '1.5rem',
    xxxlarge: '1.875rem',
    xxxxlarge: '2.25rem',
    xxxxxlarge: '3rem',
    xxxxxxlarge: '4rem',
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    heavy: 800,
  },
  leading: {
    tighter: 1,
    tight: 1.2,
    base: 1.4,
    loose: 1.6,
    looser: 1.8,
  },
  tracking: {
    tighter: '-0.02em',
    tight: '-0.01em',
    base: '0em',
    loose: '0.01em',
    looser: '0.02em',
  },
};

const palette = {
  black: '#000000',
  white: '#ffffff',
  current: 'currentColor',
  transparent: 'transparent',

  neutral100: '#fafbfc',
  neutral200: '#eff3f6',
  neutral300: '#e1e5e9',
  neutral400: '#ccd1d5',
  neutral500: '#b1b5b9',
  neutral600: '#9ca3af',
  neutral700: '#6b7280',
  neutral800: '#374151',
  neutral900: '#111827',

  ...basePalette,
};

const breakpoints = {
  small: 576,
  medium: 768,
  large: 992,
  xlarge: 1200,
};

const elevation = {
  e100: 100, // Cards
  e200: 200, // Inline dialogs (popover)
  e300: 300, // Tooltip
  e400: 400, // Modals
  e500: 500, // Toasts (notifications)
};

const radii = {
  none: 0,
  xsmall: 4,
  small: 6,
  medium: 8,
  large: 12,
  full: 9999,
};

const sizing = {
  xxsmall: 16,
  xsmall: 20,
  small: 24,
  medium: 32,
  large: 38,
  xlarge: 42,
  xxlarge: 48,
};

const spacing = {
  none: 0,
  xxsmall: 2,
  xsmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 24,
  xxlarge: 32,
};

const shadow = {
  s100: `0px 1px 2px rgba(0, 0, 0, 0.2)`, // Cards
  s200: `0px 2px 4px rgba(0, 0, 0, 0.2)`, // Inline dialogs (popover)
  s300: `0px 2px 8px rgba(0, 0, 0, 0.2)`, // Tooltip
  s400: `0px 4px 16px rgba(0, 0, 0, 0.2)`, // Modals
  s500: `-8px 8px 32px rgba(0, 0, 0, 0.2)`, // Toasts (notifications)
};

const animation = {
  duration0: '0ms',
  duration50: '40ms',
  duration100: '130ms',
  duration200: '160ms',
  duration300: '190ms',
  duration400: '220ms',
  duration500: '250ms',
  duration600: '300ms',
  duration700: '350ms',
  duration800: '400ms',
  duration900: '450ms',
  duration1000: '500ms',
  spring: `cubic-bezier(0.2, 0, 0, 1.6)`,
  easeInOut: 'cubic-bezier(.45, 0, .40, 1)',
  easeIn: `cubic-bezier(0.2, 0, 0, 1)`,
  easeOut: `cubic-bezier(0.165, 0.840, 0.440, 1)`,
  linear: 'cubic-bezier(0, 0, 1, 1)',
};

const opacity = {
  full: 1,
  none: 0,
  disabled: 0.65,
};

/**
 * Alias Tokens
 */

type HeadingStyle = {
  color: string;
  family: string;
  size: string;
  transform: Extract<CSSObject['textTransform'], string>;
  weight: number;
};

const headingStyles: { [key: string]: HeadingStyle } = {
  h1: {
    color: palette.neutral900,
    family: typography.fontFamily.heading,
    size: typography.fontSize.xxxlarge,
    transform: 'none',
    weight: typography.fontWeight.heavy,
  },
  h2: {
    color: palette.neutral900,
    family: typography.fontFamily.heading,
    size: typography.fontSize.xxlarge,
    transform: 'none',
    weight: typography.fontWeight.bold,
  },
  h3: {
    color: palette.neutral900,
    family: typography.fontFamily.heading,
    size: typography.fontSize.xlarge,
    transform: 'none',
    weight: typography.fontWeight.bold,
  },
  h4: {
    color: palette.neutral900,
    family: typography.fontFamily.heading,
    size: typography.fontSize.large,
    transform: 'none',
    weight: typography.fontWeight.bold,
  },
  h5: {
    color: palette.neutral900,
    family: typography.fontFamily.heading,
    size: typography.fontSize.medium,
    transform: 'none',
    weight: typography.fontWeight.bold,
  },
  h6: {
    color: palette.neutral900,
    family: typography.fontFamily.heading,
    size: typography.fontSize.small,
    transform: 'uppercase',
    weight: typography.fontWeight.bold,
  },
};

type ControlSize = {
  borderRadius: number;
  borderWidth: number;
  gutter: number;
  paddingX: number;
  paddingY: number;
  height: number;
  gap: number;
  fontSize: number | string;
  indicatorBoxSize: number | string;
  indicatorFontSize: number | string;
};

const controlSizes: { [key: string]: ControlSize } = {
  small: {
    borderRadius: radii.xsmall,
    borderWidth: 1,
    gutter: spacing.xsmall,
    paddingX: spacing.medium,
    paddingY: spacing.xsmall,
    height: sizing.medium,
    gap: spacing.small,
    fontSize: typography.fontSize.small,
    indicatorBoxSize: sizing.xsmall,
    indicatorFontSize: typography.fontSize.xxxsmall,
  },
  medium: {
    borderRadius: radii.small,
    borderWidth: 1,
    gutter: spacing.xsmall,
    paddingX: spacing.large,
    paddingY: spacing.xsmall,
    height: sizing.large,
    gap: spacing.medium,
    fontSize: typography.fontSize.medium,
    indicatorBoxSize: sizing.small,
    indicatorFontSize: typography.fontSize.xxsmall,
  },
  large: {
    borderRadius: radii.medium,
    borderWidth: 1,
    gutter: spacing.small,
    paddingX: spacing.large,
    paddingY: spacing.small,
    height: sizing.xxlarge,
    gap: spacing.medium,
    fontSize: typography.fontSize.large,
    indicatorBoxSize: sizing.medium,
    indicatorFontSize: typography.fontSize.small,
  },
};

const colors = {
  background: 'white',
  backgroundMuted: palette.neutral100,
  backgroundDim: palette.neutral200,
  border: palette.neutral300,
  borderCritical: palette.red400,
  borderFocus: palette.blue400,
  focusRing: palette.blue200,
  foreground: palette.neutral800,
  foregroundMuted: palette.neutral900,
  foregroundDim: palette.neutral700,
  foregroundDisabled: palette.neutral500,
  linkColor: palette.blue500,
  linkHoverColor: palette.blue600,
  overlayBackground: 'rgba(18,18,18, 0.3)', // blanket behind modal dialogs
  loaderDark: palette.neutral500,
  loaderLight: palette.neutral200,
};

/**

Tones have 3 backgrounds:
- pass-through (colors.background or colors.backgroundMuted)
- tint (tone.tint)
- fill (tone.fill)

Tones have 2 foregrounds that should work on these backgrounds:
- foreground (should work on pass-through and tint)
- fillForeground (should work on fill)

*/

type ToneColor = [string, string, string];
type Tone = {
  focusRing: string;
  border: ToneColor;
  fill: ToneColor;
  tint: ToneColor;
  foreground: ToneColor;
  fillForeground: ToneColor;
};

const tones = identityType<{ [key: string]: Tone }>()({
  active: {
    focusRing: palette.blue200,
    border: [palette.blue300, palette.blue400, palette.blue500],
    fill: [palette.blue600, palette.blue700, palette.blue800],
    tint: [palette.blue50, palette.blue100, palette.blue200],
    foreground: [palette.blue600, palette.blue700, palette.blue800],
    fillForeground: [palette.white, palette.white, palette.white],
  },
  passive: {
    focusRing: palette.neutral300,
    border: [palette.neutral300, palette.neutral400, palette.neutral500],
    fill: [palette.neutral600, palette.neutral700, palette.neutral800],
    tint: [palette.neutral200, palette.neutral300, palette.neutral400],
    foreground: [palette.neutral700, palette.neutral800, palette.neutral900],
    fillForeground: [palette.white, palette.white, palette.white],
  },
  positive: {
    focusRing: palette.green200,
    border: [palette.green300, palette.green400, palette.green500],
    fill: [palette.green600, palette.green700, palette.green800],
    tint: [palette.green50, palette.green100, palette.green200],
    foreground: [palette.green600, palette.green700, palette.green800],
    fillForeground: [palette.white, palette.white, palette.white],
  },
  warning: {
    focusRing: palette.yellow200,
    border: [palette.yellow300, palette.yellow400, palette.yellow500],
    fill: [palette.yellow400, palette.yellow500, palette.yellow600],
    tint: [palette.yellow50, palette.yellow100, palette.yellow200],
    foreground: [palette.yellow600, palette.yellow700, palette.yellow900],
    fillForeground: [palette.black, palette.black, palette.black],
  },
  negative: {
    focusRing: palette.red200,
    border: [palette.red300, palette.red400, palette.red500],
    fill: [palette.red500, palette.red600, palette.red700],
    tint: [palette.red50, palette.red100, palette.red200],
    foreground: [palette.red600, palette.red700, palette.red800],
    fillForeground: [palette.white, palette.white, palette.white],
  },
  help: {
    focusRing: palette.purple200,
    border: [palette.purple300, palette.purple400, palette.purple500],
    fill: [palette.purple500, palette.purple600, palette.purple700],
    tint: [palette.purple50, palette.purple100, palette.purple200],
    foreground: [palette.purple600, palette.purple700, palette.purple800],
    fillForeground: [palette.white, palette.white, palette.white],
  },
});

type SelectableColor = {
  border: string;
  fill: string;
  fillForeground: string;
  foreground: string;
  tint: string;
};

const selectableColors = identityType<{ [key: string]: SelectableColor }>()({
  silver: {
    border: palette.neutral400,
    fill: palette.neutral500,
    fillForeground: 'white',
    foreground: palette.neutral600,
    tint: palette.neutral200,
  },
  grey: {
    border: palette.neutral600,
    fill: palette.neutral700,
    fillForeground: 'white',
    foreground: palette.neutral700,
    tint: palette.neutral300,
  },
  blue: {
    border: palette.blue400,
    fill: palette.blue500,
    fillForeground: 'white',
    foreground: palette.blue600,
    tint: palette.blue200,
  },
  pink: {
    border: palette.pink400,
    fill: palette.pink500,
    fillForeground: 'white',
    foreground: palette.pink600,
    tint: palette.pink200,
  },
  green: {
    border: palette.green400,
    fill: palette.green500,
    fillForeground: 'white',
    foreground: palette.green600,
    tint: palette.green200,
  },
  purple: {
    border: palette.purple400,
    fill: palette.purple500,
    fillForeground: 'white',
    foreground: palette.purple600,
    tint: palette.purple200,
  },
});

type SharedFieldStateTokens = {
  labelColor?: string;
  legendColor?: string;
  shadow?: string;
};

type ControlFieldStateTokens = {
  controlBackground?: string;
  controlBorderColor?: string;
  controlBorderRadius?: number | string;
  controlForeground?: string;
};

type InputFieldStateTokens = {
  inputBackground?: string;
  inputBorderColor?: string;
  inputBorderRadius?: number | string;
  inputForeground?: string;
  iconColor?: string;
};

type FieldStateTokens = SharedFieldStateTokens & ControlFieldStateTokens & InputFieldStateTokens;

type FieldTokens = FieldStateTokens & {
  controlBorderWidth?: number | string;
  inputBorderWidth?: number | string;
  inputPlaceholder?: string;
  switchForeground?: string;
  disabled: FieldStateTokens;
  focus: FieldStateTokens;
  hover: FieldStateTokens;
  invalid: FieldStateTokens;
  selected: SharedFieldStateTokens & ControlFieldStateTokens;
};

const fields: FieldTokens = {
  controlBackground: 'white',
  controlBorderColor: palette.neutral300,
  controlBorderRadius: radii.small,
  controlBorderWidth: 2,
  controlForeground: palette.blue500,
  // iconColor: palette.neutral500, // TODO
  inputBackground: palette.neutral100,
  inputBorderColor: palette.neutral300,
  inputBorderRadius: radii.small,
  inputBorderWidth: 1,
  inputForeground: palette.neutral800,
  inputPlaceholder: palette.neutral500,

  labelColor: palette.neutral800,
  legendColor: palette.neutral600,
  switchForeground: 'white',

  hover: {
    inputBorderColor: palette.neutral400,
    controlBorderColor: palette.blue500,
  },
  focus: {
    controlBorderColor: palette.blue500,
    inputBorderColor: palette.blue500,
    inputBackground: 'white',
    shadow: `0 0 0 2px ${colors.focusRing}`,
  },
  disabled: {
    inputBackground: palette.neutral100,
    inputForeground: palette.neutral800,
    inputBorderColor: palette.transparent,
    controlBackground: palette.neutral100,
    controlBorderColor: palette.neutral200,
    controlForeground: palette.neutral500,
  },
  invalid: {
    inputBackground: palette.red100,
    inputForeground: palette.neutral700,
    labelColor: palette.red600,
  },
  selected: {
    controlBackground: palette.blue500,
    controlBorderColor: palette.blue500,
    controlForeground: 'white',
  },
};

/**
 * Export
 */

export const theme = {
  name: 'Keystone: Light',
  // Global Tokens
  typography,
  palette,
  breakpoints,
  elevation,
  radii,
  sizing,
  spacing,
  shadow,
  animation,
  opacity,
  // Alias Tokens
  headingStyles,
  controlSizes,
  colors,
  tones,
  selectableColors,
  fields,
};
