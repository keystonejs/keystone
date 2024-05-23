/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core'
import { type RenderElementProps } from 'slate-react'

const headingStylesMap = {
  h1: { fontSize: '2.2rem' },
  h2: { fontSize: '1.8rem' },
  h3: { fontSize: '1.5rem' },
  h4: { fontSize: '1.2rem' },
  h5: { fontSize: '0.83rem' },
  h6: { fontSize: '0.67rem' },
}

export function HeadingElement ({
  attributes,
  children,
  element,
}: RenderElementProps & { element: { type: 'heading' } }) {
  const Tag = `h${element.level}` as const
  const headingStyle = headingStylesMap[Tag]
  return (
    <Tag
      {...attributes}
      css={{
        ...headingStyle,
        textAlign: element.textAlign,
      }}
    >
      {children}
    </Tag>
  )
}
