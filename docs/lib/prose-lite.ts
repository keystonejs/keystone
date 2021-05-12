export const proseStyles = {
  color: 'var(--gray-800)',
  maxWidth: '65ch',
  'img, video': {
    maxWidth: '100%',
    height: 'auto',
  },
  '[class~="lead"]': {
    color: 'var(--gray-600)',
    fontSize: 'var(--font-medium)',
    lineHeight: 1.6,
    marginTop: '1.2em',
    marginBottom: '1.2em',
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
    paddingLeft: '1.75em',
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
    width: '0.375em',
    height: '0.375em',
    top: `calc(0.875em - 0.1875em)`,
    left: '0.25em',
  },
  hr: {
    borderColor: 'var(--gray-200)',
    borderTopWidth: 1,
    marginTop: '3em',
    marginBottom: '3em',
  },
  blockquote: {
    fontWeight: 500,
    fontStyle: 'italic',
    color: 'var(--gray-900)',
    borderLeftWidth: '0.25rem',
    borderLeftColor: 'var(--gray-200)',
    quotes: '"\\201C""\\201D""\\2018""\\2019"',
    marginTop: '1.6em',
    marginBottom: '1.6em',
    paddingLeft: '1em',
  },
  h1: {
    color: 'var(--gray-900)',
    fontWeight: 800,
    fontSize: 'var(--font-xxlarge)',
    marginTop: '0',
    marginBottom: '0.8888888889em',
    lineHeight: 1.1111111,
  },
  h2: {
    color: 'var(--gray-900)',
    fontWeight: 700,
    fontSize: 'var(--font-large)',
    marginTop: '2em',
    marginBottom: '1em',
    lineHeight: 1.3333333,
  },
  h3: {
    color: 'var(--gray-900)',
    fontWeight: 600,
    fontSize: 'var(--font-medium)',
    marginTop: '1.6em',
    marginBottom: '0.6em',
    lineHeight: 1.6,
  },
  h4: {
    color: 'var(--gray-900)',
    fontWeight: 600,
    marginTop: '1.5em',
    marginBottom: '0.5em',
    lineHeight: 1.5,
  },
  'figure figcaption': {
    color: 'var(--gray-500)',
    fontSize: 'var(--font-xsmall)',
    lineHeight: 1.4285714,
    marginTop: '0.8571428571em',
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
    fontSize: 'var(--font-xsmall)',
    lineHeight: 1.7142857,
    marginTop: '1.7142857143em',
    marginBottom: '1.7142857143em',
    borderRadius: '0.375rem',
    paddingTop: '0.8571428571em',
    paddingRight: '1.1428571429em',
    paddingBottom: '0.8571428571em',
    paddingLeft: '1.1428571429em',
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
    marginTop: '2em',
    marginBottom: '2em',
    fontSize: 'var(--font-xsmall)',
    lineHeight: 1.7142857,
  },
  thead: {
    color: 'var(--gray-900)',
    fontWeight: 600,
    borderBottomWidth: '1px',
    borderBottomColor: 'var(--gray-300)',
  },
  'thead th': {
    verticalAlign: 'bottom',
    paddingRight: '0.5714285714em',
    paddingBottom: '0.5714285714em',
    paddingLeft: '0.5714285714em',
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
    paddingTop: '0.5714285714em',
    paddingRight: '0.5714285714em',
    paddingBottom: '0.5714285714em',
    paddingLeft: '0.5714285714em',
  },
  fontSize: 'var(--font-small)',
  lineHeight: 1.75,
  '> p': {
    marginTop: '1.25em',
    marginBottom: '1.25em',
  },
  img: {
    marginTop: '2em',
    marginBottom: '2em',
  },
  video: {
    marginTop: '2em',
    marginBottom: '2em',
  },
  figure: {
    marginTop: '2em',
    marginBottom: '2em',
  },
  'figure > *': {
    marginTop: '0',
    marginBottom: '0',
  },
  'h2 code': {
    fontSize: 'var(--font-xsmall)',
  },
  'h3 code': {
    fontSize: 'var(--font-xsmall)',
  },
  'ol, ul': {
    listStyle: 'none',
    margin: `1.25em 0`,
    padding: 0,
  },
  li: {
    marginTop: '0.5em',
    marginBottom: '0.5em',
  },
  'ul > li': {
    paddingLeft: '1.75em',
    position: 'relative' as const,
  },
  '> ul > li p': {
    marginTop: '0.75em',
    marginBottom: '0.75em',
  },
  '> ul > li > *:first-child, > ul > li > *:last-child': {
    marginTop: '1.25em',
  },
  '> ol > li > *:first-child, > ol > li > *:last-child': {
    marginTop: '1.25em',
  },
  'ul ul, ul ol, ol ul, ol ol': {
    marginTop: '0.75em',
    marginBottom: '0.75em',
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
