/** @jsxImportSource @emotion/react */

import type { ElementType, HTMLAttributes } from 'react'

import { useMediaQuery } from '../../lib/media'

type WrapperProps = {
  as?: ElementType
} & HTMLAttributes<HTMLElement>

export function Wrapper({ as: Tag = 'div', ...props }: WrapperProps) {
  const mq = useMediaQuery()

  return (
    <Tag
      css={mq({
        maxWidth: 'var(--wrapper-width)',
        margin: '0 auto',
        paddingLeft: ['var(--space-xlarge)', 'var(--space-xlarge)', null, '3rem'],
        paddingRight: ['var(--space-xlarge)', 'var(--space-xlarge)', null, '3rem'],
      })}
      {...props}
    />
  )
}
