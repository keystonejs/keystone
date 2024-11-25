/** @jsxRuntime classic */
/** @jsx jsx */

import Link, { type LinkProps } from 'next/link'
import { type AnchorHTMLAttributes } from 'react'

import { jsx, useTheme } from '@keystone-ui/core'

/**
 * This is the component you should use when linking a Cell to an item (i.e when the Cell supports
 * the linkTo prop)
 */

export const CellLink = (props: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const { colors, spacing } = useTheme()
  return (
    <Link
      css={{
        color: colors.foreground,
        display: 'block',
        padding: spacing.small,
        textDecoration: 'none',

        ':hover': {
          textDecoration: 'underline',
        },
      }}
      {...props}
    />
  )
}
