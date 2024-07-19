/** @jsxImportSource @emotion/react */

import type { ElementType, HTMLAttributes } from 'react'

import { useMediaQuery } from '../../lib/media'

type MWrapperProps = {
  as?: ElementType
} & HTMLAttributes<HTMLElement>

export function MWrapper ({ as: Tag = 'div', ...props }: MWrapperProps) {
  const mq = useMediaQuery()

  return (
    <Tag
      css={mq({
        margin: '4rem auto 0',
        paddingLeft: [0, null, null, null, '7.5rem'],
        paddingRight: [0, null, null, null, '7.5rem'],
      })}
      {...props}
    />
  )
}
