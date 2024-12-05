import React, { type PropsWithChildren } from 'react'
import { css, tokenSchema } from '@keystar/ui/style'

export function InlineCode (props: PropsWithChildren) {
  return (
    <code className={css({
      backgroundColor: tokenSchema.color.alias.backgroundHovered,
      borderRadius: tokenSchema.size.radius.xsmall,
      color: tokenSchema.color.foreground.neutralEmphasis,
      fontFamily: tokenSchema.typography.fontFamily.code,
      paddingInline: tokenSchema.size.space.xsmall,
    })} {...props} />
  )
}