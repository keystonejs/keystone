
/** @jsxImportSource @emotion/react */

import { type HTMLAttributes } from 'react'
import { useMediaQuery } from '../../lib/media'

type PillCtaProps = {
  grad?: 'grad1' | 'grad2' | 'grad3' | 'grad4' | 'grad5' | 'grad6'
} & HTMLAttributes<HTMLElement>

export function PillCta ({ grad = 'grad1', children, ...props }: PillCtaProps) {
  const mq = useMediaQuery()

  return (
    <div
      css={mq({
        margin: '0 auto',
        maxWidth: '46rem',
        position: 'relative',
        fontSize: 'var(--font-xxsmall)',
        fontWeight: 700,
        borderRadius: '1rem',
        padding: ['1.5rem 2rem', '2rem 4rem'],
        zIndex: 1,
        '::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          borderRadius: '1rem',
          background: `linear-gradient(135deg, var(--${grad}-1), var(--${grad}-2))`,
          opacity: 0.1,
        },
      })}
      {...props}
    >
      {children}
    </div>
  )
}
