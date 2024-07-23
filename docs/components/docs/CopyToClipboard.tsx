/** @jsxImportSource @emotion/react */

import { Link } from '../icons/Link'

export function HeadingIdLink ({ value }: { value: string }) {
  return (
    <a
      href={`#${value}`}
      css={{
        position: 'absolute',
        top: '50%',
        left: '-0.25rem',
        display: 'flex',
        padding: 0,
        alignItems: 'center',
        color: 'var(--text)',
        fontSize: 'var(--font-small)',
        height: '1rem',
        width: '1rem',
        justifyContent: 'center',
        opacity: 0,
        overflow: 'visible',
        margin: '-0.5rem 0 0 0',
        transform: 'translateX(-100%)',
        borderRadius: '100%',

        '&:hover': {
          color: 'var(--link)',
        },
      }}
    >
      <Link css={{ height: '1rem' }} />
    </a>
  )
}
