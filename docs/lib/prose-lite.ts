export const proseStyles = {
  color: 'var(--text)',
  'img, video': {
    maxWidth: '100%',
    height: 'auto',
  },
  'blockquote p:first-of-type::before, blockquote p:last-of-type::after': {
    content: '""',
  },
  a: {
    textDecoration: 'underline',
    fontWeight: 500,
    color: 'inherit',
  },
  'a:hover': {
    color: 'var(--link)',
  },
  strong: {
    color: 'inherit',
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
    fontSize: '1.125rem',
  },
  'ol > li::before': {
    content: 'counter(list-item, var(--list-counter-style, decimal)) "."',
    position: 'absolute' as const,
    fontWeight: 400,
    color: 'var(--text)',
    left: '0',
  },
  'ul > li::before': {
    content: '""',
    position: 'absolute' as const,
    backgroundColor: 'var(--muted)',
    borderRadius: '50%',
    width: '0.375em',
    height: '0.375em',
    top: `calc(0.875em - 0.1875em)`,
    left: '0.25em',
  },
  hr: {
    border: '0 none',
    borderTop: '2px solid var(--border)',
    margin: '3em auto',
    width: '70%',
  },
  blockquote: {
    fontWeight: 500,
    fontStyle: 'italic',
    color: 'var(--text)',
    borderLeftWidth: '0.25rem',
    borderLeftColor: 'var(--border)',
    quotes: '"\\201C""\\201D""\\2018""\\2019"',
    marginTop: '1.6em',
    marginBottom: '1.6em',
    paddingLeft: '1em',
  },
  // h1: {
  //   color: 'var(--text)',
  //   fontWeight: 800,
  //   fontSize: 'var(--font-xxlarge)',
  //   marginTop: '0',
  //   marginBottom: '0.8888888889em',
  //   lineHeight: 1.1111111,
  // },
  h2: {
    color: 'var(--text-heading)',
    fontWeight: 700,
    fontSize: 'var(--font-large)',
    marginTop: '2em',
    marginBottom: '1em',
    lineHeight: 1.3333333,
  },
  h3: {
    color: 'var(--text-heading)',
    fontWeight: 600,
    fontSize: 'var(--font-medium)',
    marginTop: '1.6em',
    marginBottom: '0.6em',
    lineHeight: 1.6,
  },
  h4: {
    color: 'var(--text-heading)',
    fontWeight: 600,
    marginTop: '1.5em',
    marginBottom: '0.5em',
    lineHeight: 1.5,
  },
  'figure figcaption': {
    color: 'var(--text-heading)',
    fontSize: 'var(--font-xsmall)',
    lineHeight: 1.4285714,
    marginTop: '0.8571428571em',
  },
  code: {
    color: 'var(--text-heading)',
  },
  'a code': {
    color: 'var(--code)',
    textDecoration: 'underline',
  },
  pre: {
    overflowX: 'auto' as const,
    color: 'var(--code)',
    backgroundColor: 'var(--code-bg)',
    border: `1px solid ${'var(--border)'}`,
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
    marginTop: '2rem',
    marginBottom: '2rem',
    fontSize: 'var(--font-xsmall)',
    lineHeight: 1.7142857,
    maxWidth: '100%',
    overflowX: 'auto' as const,
    display: 'block',
  },
  thead: {
    color: 'var(--text)',
    fontWeight: 600,
  },
  'thead th': {
    verticalAlign: 'bottom',
    paddingRight: '0.5714285714em',
    paddingBottom: '0.5714285714em',
    paddingLeft: '0.5714285714em',
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
    '> code': {
      whiteSpace: 'nowrap' as const,
    },
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
