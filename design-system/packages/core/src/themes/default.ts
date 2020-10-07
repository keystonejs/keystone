import { identityType } from '../utils';

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

  // https://smart-swatch.netlify.app/#E8E8E8

  // neutral100: '#f2f2f2',
  // neutral200: '#d9d9d9',
  // neutral300: '#bfbfbf',
  // neutral400: '#a6a6a6',
  // neutral500: '#8c8c8c',
  // neutral600: '#737373',
  // neutral700: '#595959',
  // neutral800: '#404040',
  // neutral900: '#262626',

  // Custom

  // neutral100: '#fafbfc',
  // neutral200: '#d9d9d9',
  // neutral300: '#bfbfbf',
  // neutral400: '#a6a6a6',
  // neutral500: '#8c8c8c',
  // neutral600: '#737373',
  // neutral700: '#595959',
  // neutral800: '#404040',
  // neutral900: '#262626',

  // https://www.colorbox.io/#steps=10#hue_start=204#hue_end=225#hue_curve=easeInQuad#sat_start=1#sat_end=3#sat_curve=easeOutQuad#sat_rate=124#lum_start=100#lum_end=18#lum_curve=easeOutSine#minor_steps_map=0

  // neutral50: '#fcfeff',
  // neutral100: '#fafbfc',
  // neutral200: '#f8fafc',
  // neutral300: '#edf1f3',
  // neutral400: '#dcdfe2',
  // neutral500: '#c1c5c8',
  // neutral600: '#a0a2a5',
  // neutral700: '#7a7b7e',
  // neutral800: '#525355',
  // neutral900: '#2c2d2e',

  // https://www.colorbox.io/#steps=10#hue_start=204#hue_end=225#hue_curve=easeInQuad#sat_start=1#sat_end=6#sat_curve=easeOutQuad#sat_rate=124#lum_start=100#lum_end=18#lum_curve=easeOutSine#minor_steps_map=0

  neutral100: '#fafbfc',
  neutral200: '#eff3f6',
  neutral300: '#e1e5e9',
  neutral400: '#ccd1d5',
  neutral500: '#b1b5b9',
  neutral600: '#929599',
  neutral700: '#707275',
  neutral800: '#4d4e51',
  neutral900: '#2c2c2e',

  // Previous...
  // neutral100: '#F8F9F9',
  // neutral200: '#F0F1F2',
  // neutral300: '#E5E5E6',
  // neutral400: '#C8C8C9',
  // neutral500: '#9B9B9B',
  // neutral600: '#5B5B5B',
  // neutral700: '#121212',

  // https://smart-swatch.netlify.app/#F33238

  red100: '#ffe3e5',
  red200: '#ffb5b7',
  red300: '#fa8689',
  red400: '#f6555a',
  red500: '#f2262d',
  red600: '#d90d13',
  red700: '#aa070e',
  red800: '#790309',
  red900: '#4b0003',

  // Previous...
  // red100: '#FFDEDE',
  // red200: '#FDADAF',
  // red300: '#FB7E81',
  // red400: '#F33238',
  // red500: '#E40410',
  // red600: '#CC0011',
  // red700: '#AD0014',

  // https://smart-swatch.netlify.app/#FDE85A (hue down)
  yellow100: '#fff8dc',
  yellow200: '#feefaf',
  yellow300: '#fde97f',
  yellow400: '#fde64f',
  yellow500: '#fcd020',
  yellow600: '#e3a90a',
  yellow700: '#b07702',
  yellow800: '#7e4c00',
  yellow900: '#4c2900',

  // Previous...
  // yellow100: '#FFF8BD',
  // yellow200: '#FEF18B',
  // yellow300: '#FDE85A',
  // yellow400: '#F7CA0C',
  // yellow500: '#EEA400',
  // yellow600: '#DF7300',
  // yellow700: '#CC4400',

  // https://smart-swatch.netlify.app/#389c60

  green100: '#e2fbf1',
  green200: '#c2ecd8',
  green300: '#9edebe',
  green400: '#7bd0a2',
  green500: '#56c285',
  green600: '#3da968',
  green700: '#2d8356',
  green800: '#1e5e41',
  green900: '#0d392a',

  // https://smart-swatch.netlify.app/#139450 (hue down)

  // green100: '#dfffe9',
  // green200: '#b7f7cb',
  // green300: '#8cf0af',
  // green400: '#61eb94',
  // green500: '#38e57c',
  // green600: '#1fcb69',
  // green700: '#149e56',
  // green800: '#0a7136',
  // green900: '#01451a',

  // https://smart-swatch.netlify.app/#16AB56

  // green100: '#dfffee',
  // green200: '#b7f7d3',
  // green300: '#8cf0b7',
  // green400: '#61eb9c',
  // green500: '#38e581',
  // green600: '#1fcb67',
  // green700: '#149e50',
  // green800: '#0b7138',
  // green900: '#014420',

  // Previous...

  // green100: '#DEFBE6',
  // green200: '#C4FCD2',
  // green300: '#BAF9CB',
  // green400: '#93ECAE',
  // green500: '#53D484',
  // green600: '#09AF58',
  // green700: '#00804A',

  // https://smart-swatch.netlify.app/#4fccd1

  teal100: '#ddfcff',
  teal200: '#baeff1',
  teal300: '#95e3e6',
  teal400: '#6ed6da',
  teal500: '#49cacf',
  teal600: '#30b1b6',
  teal700: '#1f898e',
  teal800: '#0f6366',
  teal900: '#003c3f',

  // Previous...

  // teal100: '#D9FBFB',
  // teal200: '#C4FCF3',
  // teal300: '#BAF9F0',
  // teal400: '#93ECE2',
  // teal500: '#53D4CF',
  // teal600: '#09A5AF',
  // teal700: '#006A80',

  // Colorbox colors | Hue 193:198 | Sat 4:90 QuadEaseOut 130 | B 100:53

  cyan100: '#f2fcff',
  cyan200: '#caf2fd',
  cyan300: '#a4e8fc',
  cyan400: '#5dd3f5',
  cyan500: '#27bdeb',
  cyan600: '#04a6db',
  cyan700: '#0091c4',
  cyan800: '#0078a7',
  cyan900: '#005f87',

  // https://smart-swatch.netlify.app/#007BC7

  // cyan100: '#dbf7ff',
  // cyan200: '#aee3ff',
  // cyan300: '#7eceff',
  // cyan400: '#4dbbff',
  // cyan500: '#22a7fe',
  // cyan600: '#0f8ee5',
  // cyan700: '#006eb3',
  // cyan800: '#004f81',
  // cyan900: '#002f50',

  // https://smart-swatch.netlify.app/#28AEEC

  // cyan100: '#dcf8ff',
  // cyan200: '#b2e6fd',
  // cyan300: '#85d3f7',
  // cyan400: '#58c1f2',
  // cyan500: '#2cb0ec',
  // cyan600: '#1396d3',
  // cyan700: '#0275a5',
  // cyan800: '#005377',
  // cyan900: '#00334a',

  // Previous...

  // cyan100: '#CDEDFF',
  // cyan200: '#BDE7FF',
  // cyan300: '#9BE2FF',
  // cyan400: '#5ACEFF',
  // cyan500: '#00B2FF',
  // cyan600: '#007BC7',
  // cyan700: '#004887',

  // https://www.colorbox.io/#steps=8#hue_start=204#hue_end=225#hue_curve=easeInQuad#sat_start=4#sat_end=82#sat_curve=easeOutQuad#sat_rate=124#lum_start=100#lum_end=53#lum_curve=easeOutSine#minor_steps_map=0

  blue100: '#f2faff',
  blue200: '#d1ecfe',
  blue300: '#afddfd',
  blue400: '#71bcf6',
  blue500: '#409ae9',
  blue600: '#1f77d5',
  blue700: '#0b54bc',
  blue800: '#0136a1',
  blue900: '#002287',

  // https://smart-swatch.netlify.app/#3182CE

  // blue100: '#e0efff',
  // blue200: '#bcd3f5',
  // blue300: '#95b9ea',
  // blue400: '#6da0de',
  // blue500: '#468ad3',
  // blue600: '#2c75b9',
  // blue700: '#1f5391',
  // blue800: '#123669',
  // blue900: '#051b42',

  // https://smart-swatch.netlify.app/#0c68ec

  // blue100: '#e0f1ff',
  // blue200: '#b2d3ff',
  // blue300: '#83b5fc',
  // blue400: '#5397f7',
  // blue500: '#257af4',
  // blue600: '#0b60da',
  // blue700: '#034bab',
  // blue800: '#00357b',
  // blue900: '#00204d',

  // https://smart-swatch.netlify.app/#007AFF

  // blue100: '#dbf4ff',
  // blue200: '#addbff',
  // blue300: '#7cc1ff',
  // blue400: '#4aa8ff',
  // blue500: '#1a8fff',
  // blue600: '#0075e6',
  // blue700: '#005bb4',
  // blue800: '#004182',
  // blue900: '#002751',

  // Previous...

  // blue100: '#E3F4FF',
  // blue200: '#C1D9FF',
  // blue300: '#A3CAFF',
  // blue400: '#65A2FF',
  // blue500: '#0F62FE',
  // blue600: '#0030C7',
  // blue700: '#001287',

  // https://smart-swatch.netlify.app/#7e5bcc

  purple100: '#f2eaff',
  purple200: '#d2c4f2',
  purple300: '#b39ee3',
  purple400: '#9477d6',
  purple500: '#7550c9',
  purple600: '#5c36af',
  purple700: '#472a89',
  purple800: '#331d63',
  purple900: '#1f113d',

  // https://smart-swatch.netlify.app/#6e46c5

  // purple100: '#f2eaff',
  // purple200: '#d2c4f2',
  // purple300: '#b39ee3',
  // purple400: '#9477d5',
  // purple500: '#7650c8',
  // purple600: '#5d37af',
  // purple700: '#482b89',
  // purple800: '#331d63',
  // purple900: '#1f113d',

  // https://smart-swatch.netlify.app/#8141BC

  // purple100: '#f7eaff',
  // purple200: '#dcc5ef',
  // purple300: '#c29fe0',
  // purple400: '#a87ad2',
  // purple500: '#8f54c4',
  // purple600: '#753bab',
  // purple700: '#5b2e86',
  // purple800: '#412061',
  // purple900: '#28133c',

  // Previous...

  // purple100: '#E9E4FF',
  // purple200: '#DBD4FC',
  // purple300: '#D3CAF9',
  // purple400: '#B0A0EC',
  // purple500: '#795CD4',
  // purple600: '#3B0DAF',
  // purple700: '#2A0080',

  // https://smart-swatch.netlify.app/#F84184

  pink100: '#ffe3f1',
  pink200: '#ffb3cf',
  pink300: '#fb83af',
  pink400: '#f95390',
  pink500: '#f62570',
  pink600: '#dc0e56',
  pink700: '#ac0643',
  pink800: '#7c0230',
  pink900: '#4c001d',

  // Previous...

  // pink100: '#FFDEE9',
  // pink200: '#FDADCA',
  // pink300: '#FB7EAB',
  // pink400: '#F84184',
  // pink500: '#E4045D',
  // pink600: '#CC005A',
  // pink700: '#AD0054',

  orange100: '#ffeedf',
  orange200: '#fed0b3',
  orange300: '#fab285',
  orange400: '#f69355',
  orange500: '#f27527',
  orange600: '#d95c0e',
  orange700: '#aa4709',
  orange800: '#7a3305',
  orange900: '#4b1d00',
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
  size: string;
  weight: number;
  transform: string;
};

const headingStyles: { [key: string]: HeadingStyle } = {
  h1: {
    color: palette.neutral800,
    size: typography.fontSize.xxxlarge,
    weight: typography.fontWeight.heavy,
    transform: 'none',
  },
  h2: {
    color: palette.neutral800,
    size: typography.fontSize.xxlarge,
    weight: typography.fontWeight.bold,
    transform: 'none',
  },
  h3: {
    color: palette.neutral800,
    size: typography.fontSize.xlarge,
    weight: typography.fontWeight.bold,
    transform: 'none',
  },
  h4: {
    color: palette.neutral800,
    size: typography.fontSize.large,
    weight: typography.fontWeight.bold,
    transform: 'none',
  },
  h5: {
    color: palette.neutral800,
    size: typography.fontSize.medium,
    weight: typography.fontWeight.bold,
    transform: 'none',
  },
  h6: {
    color: palette.neutral800,
    size: typography.fontSize.small,
    weight: typography.fontWeight.bold,
    transform: 'uppercase',
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
    borderRadius: radii.small,
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
    borderRadius: radii.medium,
    borderWidth: 1,
    gutter: spacing.xsmall,
    paddingX: spacing.medium,
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
    tint: [palette.blue100, '#E7F5FF', '#DBF1FF'],
    foreground: [palette.blue600, palette.blue700, palette.blue800],
    fillForeground: [palette.white, palette.white, palette.white],
  },
  passive: {
    focusRing: palette.neutral300,
    border: [palette.neutral400, palette.neutral500, palette.neutral600],
    fill: [palette.neutral600, palette.neutral700, palette.neutral800],
    tint: [palette.neutral200, palette.neutral300, palette.neutral400],
    foreground: [palette.neutral700, palette.neutral800, palette.neutral900],
    fillForeground: [palette.white, palette.white, palette.white],
  },
  positive: {
    focusRing: palette.green200,
    border: [palette.green300, palette.green400, palette.green500],
    fill: [palette.green600, palette.green700, palette.green800],
    tint: [palette.green100, palette.green200, palette.green300],
    foreground: [palette.green700, palette.green800, palette.green800],
    fillForeground: [palette.white, palette.white, palette.white],
  },
  warning: {
    focusRing: palette.yellow200,
    border: [palette.yellow400, palette.yellow500, palette.yellow600],
    fill: [palette.yellow400, palette.yellow500, palette.yellow600],
    tint: [palette.yellow100, palette.yellow200, palette.yellow300],
    foreground: [palette.yellow700, palette.yellow900, palette.yellow900],
    fillForeground: [palette.black, palette.black, palette.black],
  },
  negative: {
    focusRing: palette.red200,
    border: [palette.red300, palette.red400, palette.red500],
    fill: [palette.red500, palette.red600, palette.red700],
    tint: [palette.red100, palette.red200, palette.red300],
    foreground: [palette.red700, palette.red800, palette.red800],
    fillForeground: [palette.white, palette.white, palette.white],
  },
  help: {
    focusRing: palette.purple200,
    border: [palette.purple300, palette.purple400, palette.purple500],
    fill: [palette.purple500, palette.purple600, palette.purple700],
    tint: [palette.purple100, palette.purple200, palette.purple300],
    foreground: [palette.purple700, palette.purple800, palette.purple800],
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
  inputBackground: palette.neutral200,
  inputBorderColor: 'transparent',
  inputBorderRadius: radii.small,
  inputBorderWidth: 1,
  inputForeground: palette.neutral800,
  inputPlaceholder: palette.neutral500,

  labelColor: palette.neutral800,
  switchForeground: 'white',

  hover: {
    inputBorderColor: palette.neutral300,
    controlBorderColor: palette.blue500,
  },
  focus: {
    controlBorderColor: palette.blue500,
    inputBorderColor: palette.blue500,
    shadow: `0 0 0 2px ${colors.focusRing}`,
  },
  disabled: {
    inputBackground: palette.neutral300,
    inputForeground: palette.neutral600,
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
