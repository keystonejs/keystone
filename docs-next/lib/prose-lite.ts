const round = (num: number) =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, '$1')
    .replace(/\.0$/, '');
const rem = (px: number) => `${round(px / 16)}rem`;
const em = (px: number, base: number) => `${round(px / base)}em`;

export const proseStyles = {
  color: 'var(--gray-800)',
  maxWidth: '65ch',
  '[class~="lead"]': {
    color: 'var(--gray-600)',
    fontSize: em(20, 16),
    lineHeight: round(32 / 20),
    marginTop: em(24, 20),
    marginBottom: em(24, 20),
  },
  'blockquote p:first-of-type::before, blockquote p:last-of-type::after': {
    content: '""',
  },
  a: {
    color: 'var(--gray-900)',
    textDecoration: 'underline',
    fontWeight: 500,
  },
  strong: {
    color: 'var(--gray-900)',
    fontWeight: 600,
  },
  'ol[type="A"], ol[type="A" s]': {
    '--list-counter-style': 'upper-alpha',
  },
  'ol[type="a"], ol[type="a" s]': {
    '--list-counter-style': 'lower-alpha',
  },
  'ol[type="I"], ol[type="I" s]': {
    '--list-counter-style': 'upper-roman',
  },
  'ol[type="i"], ol[type="i" s]': {
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
    color: 'var(--gray-500)',
    left: '0',
  },
  'ul > li::before': {
    content: '""',
    position: 'absolute' as const,
    backgroundColor: 'var(--gray-300)',
    borderRadius: '50%',
    width: em(6, 16),
    height: em(6, 16),
    top: `calc(${em(28 / 2, 16)} - ${em(3, 16)})`,
    left: em(4, 16),
  },
  hr: {
    borderColor: 'var(--gray-200)',
    borderTopWidth: 1,
    marginTop: em(48, 16),
    marginBottom: em(48, 16),
  },
  blockquote: {
    fontWeight: 500,
    fontStyle: 'italic',
    color: 'var(--gray-900)',
    borderLeftWidth: '0.25rem',
    borderLeftColor: 'var(--gray-200)',
    quotes: '"\\201C""\\201D""\\2018""\\2019"',
    marginTop: em(32, 20),
    marginBottom: em(32, 20),
    paddingLeft: em(20, 20),
  },
  h1: {
    color: 'var(--gray-900)',
    fontWeight: 800,
    fontSize: em(36, 16),
    marginTop: '0',
    marginBottom: em(32, 36),
    lineHeight: round(40 / 36),
  },
  h2: {
    color: 'var(--gray-900)',
    fontWeight: 700,
    fontSize: em(24, 16),
    marginTop: em(48, 24),
    marginBottom: em(24, 24),
    lineHeight: round(32 / 24),
  },
  h3: {
    color: 'var(--gray-900)',
    fontWeight: 600,
    fontSize: em(20, 16),
    marginTop: em(32, 20),
    marginBottom: em(12, 20),
    lineHeight: round(32 / 20),
  },
  h4: {
    color: 'var(--gray-900)',
    fontWeight: 600,
    marginTop: em(24, 16),
    marginBottom: em(8, 16),
    lineHeight: round(24 / 16),
  },
  'figure figcaption': {
    color: 'var(--gray-500)',
    fontSize: em(14, 16),
    lineHeight: round(20 / 14),
    marginTop: em(12, 14),
  },
  code: {
    color: 'var(--gray-900)',
    fontWeight: 600,
  },
  'a code': {
    color: 'var(--gray-900)',
  },
  pre: {
    overflowX: 'auto' as const,
    color: 'var(--gray-800)',
    backgroundColor: 'var(--gray-50)',
    border: `1px solid ${'var(--gray-100)'}`,
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
  'pre code::before, pre code::after': {
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
    color: 'var(--gray-900)',
    fontWeight: 600,
    borderBottomWidth: '1px',
    borderBottomColor: 'var(--gray-300)',
  },
  'thead th': {
    verticalAlign: 'bottom',
    paddingRight: em(8, 14),
    paddingBottom: em(8, 14),
    paddingLeft: em(8, 14),
  },
  'tbody tr': {
    borderBottomWidth: '1px',
    borderBottomColor: 'var(--gray-200)',
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
  'ol, ul': {
    listStyle: 'none',
    margin: `${em(20, 16)} 0`,
    padding: 0,
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
  '> ul > li > *:first-child, > ul > li > *:last-child': {
    marginTop: em(20, 16),
  },
  '> ol > li > *:first-child, > ol > li > *:last-child': {
    marginTop: em(20, 16),
  },
  'ul ul, ul ol, ol ul, ol ol': {
    marginTop: em(12, 16),
    marginBottom: em(12, 16),
  },
  'hr + *, h2 + *, h3 + *, h4 + *, > :first-child': {
    marginTop: '0',
  },
  'thead th:first-child, tbody td:first-child': {
    paddingLeft: '0',
  },
  'thead th:last-child, tbody td:last-child': {
    paddingRight: '0',
  },
  '> :last-child': {
    marginBottom: '0',
  },
};
