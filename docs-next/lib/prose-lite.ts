const round = (num: number) =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, '$1')
    .replace(/\.0$/, '');
const rem = (px: number) => `${round(px / 16)}rem`;
const em = (px: number, base: number) => `${round(px / base)}em`;

const defaultTheme = {
  colors: {
    transparent: 'transparent',
    current: 'currentColor',

    black: '#000',
    white: '#fff',

    gray: {
      50: '#f8fafc',
      100: '#f7fafc',
      200: '#edf2f7',
      300: '#e2e8f0',
      400: '#cbd5e0',
      500: '#a0aec0',
      600: '#718096',
      700: '#4a5568',
      800: '#2d3748',
      900: '#1a202c',
    },
    red: {
      100: '#fff5f5',
      200: '#fed7d7',
      300: '#feb2b2',
      400: '#fc8181',
      500: '#f56565',
      600: '#e53e3e',
      700: '#c53030',
      800: '#9b2c2c',
      900: '#742a2a',
    },
    orange: {
      100: '#fffaf0',
      200: '#feebc8',
      300: '#fbd38d',
      400: '#f6ad55',
      500: '#ed8936',
      600: '#dd6b20',
      700: '#c05621',
      800: '#9c4221',
      900: '#7b341e',
    },
    yellow: {
      100: '#fffff0',
      200: '#fefcbf',
      300: '#faf089',
      400: '#f6e05e',
      500: '#ecc94b',
      600: '#d69e2e',
      700: '#b7791f',
      800: '#975a16',
      900: '#744210',
    },
    green: {
      100: '#f0fff4',
      200: '#c6f6d5',
      300: '#9ae6b4',
      400: '#68d391',
      500: '#48bb78',
      600: '#38a169',
      700: '#2f855a',
      800: '#276749',
      900: '#22543d',
    },
    teal: {
      100: '#e6fffa',
      200: '#b2f5ea',
      300: '#81e6d9',
      400: '#4fd1c5',
      500: '#38b2ac',
      600: '#319795',
      700: '#2c7a7b',
      800: '#285e61',
      900: '#234e52',
    },
    blue: {
      100: '#ebf8ff',
      200: '#bee3f8',
      300: '#90cdf4',
      400: '#63b3ed',
      500: '#4299e1',
      600: '#3182ce',
      700: '#2b6cb0',
      800: '#2c5282',
      900: '#2a4365',
    },
    indigo: {
      100: '#ebf4ff',
      200: '#c3dafe',
      300: '#a3bffa',
      400: '#7f9cf5',
      500: '#667eea',
      600: '#5a67d8',
      700: '#4c51bf',
      800: '#434190',
      900: '#3c366b',
    },
    purple: {
      100: '#faf5ff',
      200: '#e9d8fd',
      300: '#d6bcfa',
      400: '#b794f4',
      500: '#9f7aea',
      600: '#805ad5',
      700: '#6b46c1',
      800: '#553c9a',
      900: '#44337a',
    },
    pink: {
      100: '#fff5f7',
      200: '#fed7e2',
      300: '#fbb6ce',
      400: '#f687b3',
      500: '#ed64a6',
      600: '#d53f8c',
      700: '#b83280',
      800: '#97266d',
      900: '#702459',
    },
  },
};

export const proseStyles = {
  color: defaultTheme.colors.gray[800],
  maxWidth: '65ch',
  '[class~="lead"]': {
    color: defaultTheme.colors.gray[600],
    fontSize: em(20, 16),
    lineHeight: round(32 / 20),
    marginTop: em(24, 20),
    marginBottom: em(24, 20),
  },
  'blockquote p:first-of-type::before': {
    content: '""',
  },
  'blockquote p:last-of-type::after': {
    content: '""',
  },
  a: {
    color: defaultTheme.colors.gray[900],
    textDecoration: 'underline',
    fontWeight: 500,
  },
  strong: {
    color: defaultTheme.colors.gray[900],
    fontWeight: 600,
  },
  'ol[type="A"]': {
    '--list-counter-style': 'upper-alpha',
  },
  'ol[type="a"]': {
    '--list-counter-style': 'lower-alpha',
  },
  'ol[type="A" s]': {
    '--list-counter-style': 'upper-alpha',
  },
  'ol[type="a" s]': {
    '--list-counter-style': 'lower-alpha',
  },
  'ol[type="I"]': {
    '--list-counter-style': 'upper-roman',
  },
  'ol[type="i"]': {
    '--list-counter-style': 'lower-roman',
  },
  'ol[type="I" s]': {
    '--list-counter-style': 'upper-roman',
  },
  'ol[type="i" s]': {
    '--list-counter-style': 'lower-roman',
  },
  'ol[type="1"]': {
    '--list-counter-style': 'decimal',
  },
  'ol > li': {
    position: 'relative' as const,
    paddingLeft: em(28, 16),
  },
  'ol > li::before': {
    content: 'counter(list-item, var(--list-counter-style, decimal)) "."',
    position: 'absolute' as const,
    fontWeight: 400,
    color: defaultTheme.colors.gray[500],
    left: '0',
  },
  'ul > li::before': {
    content: '""',
    position: 'absolute' as const,
    backgroundColor: defaultTheme.colors.gray[300],
    borderRadius: '50%',
    width: em(6, 16),
    height: em(6, 16),
    top: `calc(${em(28 / 2, 16)} - ${em(3, 16)})`,
    left: em(4, 16),
  },
  hr: {
    borderColor: defaultTheme.colors.gray[200],
    borderTopWidth: 1,
    marginTop: em(48, 16),
    marginBottom: em(48, 16),
  },
  blockquote: {
    fontWeight: 500,
    fontStyle: 'italic',
    color: defaultTheme.colors.gray[900],
    borderLeftWidth: '0.25rem',
    borderLeftColor: defaultTheme.colors.gray[200],
    quotes: '"\\201C""\\201D""\\2018""\\2019"',
    marginTop: em(32, 20),
    marginBottom: em(32, 20),
    paddingLeft: em(20, 20),
  },
  h1: {
    color: defaultTheme.colors.gray[900],
    fontWeight: 800,
    fontSize: em(36, 16),
    marginTop: '0',
    marginBottom: em(32, 36),
    lineHeight: round(40 / 36),
  },
  h2: {
    color: defaultTheme.colors.gray[900],
    fontWeight: 700,
    fontSize: em(24, 16),
    marginTop: em(48, 24),
    marginBottom: em(24, 24),
    lineHeight: round(32 / 24),
  },
  h3: {
    color: defaultTheme.colors.gray[900],
    fontWeight: 600,
    fontSize: em(20, 16),
    marginTop: em(32, 20),
    marginBottom: em(12, 20),
    lineHeight: round(32 / 20),
  },
  h4: {
    color: defaultTheme.colors.gray[900],
    fontWeight: 600,
    marginTop: em(24, 16),
    marginBottom: em(8, 16),
    lineHeight: round(24 / 16),
  },
  'figure figcaption': {
    color: defaultTheme.colors.gray[500],
    fontSize: em(14, 16),
    lineHeight: round(20 / 14),
    marginTop: em(12, 14),
  },
  code: {
    color: defaultTheme.colors.gray[900],
    fontWeight: 600,
  },
  'code::before': {
    content: '"`"',
  },
  'code::after': {
    content: '"`"',
  },
  'a code': {
    color: defaultTheme.colors.gray[900],
  },
  pre: {
    overflowX: 'auto' as const,
    color: defaultTheme.colors.gray[800],
    backgroundColor: defaultTheme.colors.gray[50],
    border: `1px solid ${defaultTheme.colors.gray[100]}`,
    fontSize: em(14, 16),
    lineHeight: round(24 / 14),
    marginTop: em(24, 14),
    marginBottom: em(24, 14),
    borderRadius: rem(6),
    paddingTop: em(12, 14),
    paddingRight: em(16, 14),
    paddingBottom: em(12, 14),
    paddingLeft: em(16, 14),
  },
  'pre code': {
    backgroundColor: 'transparent',
    borderWidth: '0',
    borderRadius: '0',
    padding: '0',
    fontWeight: 400,
    color: 'inherit',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    lineHeight: 'inherit',
  },
  'pre code::before': {
    content: 'none',
  },
  'pre code::after': {
    content: 'none',
  },
  table: {
    width: '100%',
    tableLayout: 'auto' as const,
    textAlign: 'left' as const,
    marginTop: em(32, 16),
    marginBottom: em(32, 16),
    fontSize: em(14, 16),
    lineHeight: round(24 / 14),
  },
  thead: {
    color: defaultTheme.colors.gray[900],
    fontWeight: 600,
    borderBottomWidth: '1px',
    borderBottomColor: defaultTheme.colors.gray[300],
  },
  'thead th': {
    verticalAlign: 'bottom',
    paddingRight: em(8, 14),
    paddingBottom: em(8, 14),
    paddingLeft: em(8, 14),
  },
  'tbody tr': {
    borderBottomWidth: '1px',
    borderBottomColor: defaultTheme.colors.gray[200],
  },
  'tbody tr:last-child': {
    borderBottomWidth: '0',
  },
  'tbody td': {
    verticalAlign: 'top',
    paddingTop: em(8, 14),
    paddingRight: em(8, 14),
    paddingBottom: em(8, 14),
    paddingLeft: em(8, 14),
  },
  fontSize: rem(16),
  lineHeight: round(28 / 16),
  '> p': {
    marginTop: em(20, 16),
    marginBottom: em(20, 16),
  },
  img: {
    marginTop: em(32, 16),
    marginBottom: em(32, 16),
  },
  video: {
    marginTop: em(32, 16),
    marginBottom: em(32, 16),
  },
  figure: {
    marginTop: em(32, 16),
    marginBottom: em(32, 16),
  },
  'figure > *': {
    marginTop: '0',
    marginBottom: '0',
  },
  'h2 code': {
    fontSize: em(21, 24),
  },
  'h3 code': {
    fontSize: em(18, 20),
  },
  ol: {
    marginTop: em(20, 16),
    marginBottom: em(20, 16),
  },
  ul: {
    marginTop: em(20, 16),
    marginBottom: em(20, 16),
  },
  li: {
    marginTop: em(8, 16),
    marginBottom: em(8, 16),
  },
  'ul > li': {
    paddingLeft: em(28, 16),
    position: 'relative' as const,
  },
  '> ul > li p': {
    marginTop: em(12, 16),
    marginBottom: em(12, 16),
  },
  '> ul > li > *:first-child': {
    marginTop: em(20, 16),
  },
  '> ul > li > *:last-child': {
    marginBottom: em(20, 16),
  },
  '> ol > li > *:first-child': {
    marginTop: em(20, 16),
  },
  '> ol > li > *:last-child': {
    marginBottom: em(20, 16),
  },
  'ul ul, ul ol, ol ul, ol ol': {
    marginTop: em(12, 16),
    marginBottom: em(12, 16),
  },
  'hr + *': {
    marginTop: '0',
  },
  'h2 + *': {
    marginTop: '0',
  },
  'h3 + *': {
    marginTop: '0',
  },
  'h4 + *': {
    marginTop: '0',
  },
  'thead th:first-child': {
    paddingLeft: '0',
  },
  'thead th:last-child': {
    paddingRight: '0',
  },
  'tbody td:first-child': {
    paddingLeft: '0',
  },
  'tbody td:last-child': {
    paddingRight: '0',
  },
  '> :first-child': {
    marginTop: '0',
  },
  '> :last-child': {
    marginBottom: '0',
  },
};
