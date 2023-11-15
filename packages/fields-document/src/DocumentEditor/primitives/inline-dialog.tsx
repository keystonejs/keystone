/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Portal, useTheme } from '@keystone-ui/core'
import { type HTMLAttributes, forwardRef } from 'react'

type Props = {
  /** Without using a 3rd-party position lib, like popper, you can place the
   * dialog within a relatively positioned element to center it. This can be
   * beneficial for simple scenarios and performance. */
  isRelative?: boolean
} & HTMLAttributes<HTMLDivElement>

export const InlineDialog = forwardRef<HTMLDivElement, Props>(({ isRelative, ...props }, ref) => {
  const { radii, spacing } = useTheme()
  const relativeStyles = isRelative
    ? {
        left: '50%',
        margin: spacing.small,
        transform: 'translateX(-50%)',
      }
    : {}

  let dialog = (
    <div
      ref={ref}
      contentEditable={false}
      css={{
        background: 'white',
        borderRadius: radii.small,
        boxShadow: `rgba(9, 30, 66, 0.31) 0px 0px 1px, rgba(9, 30, 66, 0.25) 0px 4px 8px -2px`,
        padding: spacing.small,
        position: 'absolute',
        userSelect: 'none',
        ...relativeStyles,
      }}
      {...props}
    />
  )

  if (isRelative) {
    return dialog
  }

  return <Portal>{dialog}</Portal>
})
