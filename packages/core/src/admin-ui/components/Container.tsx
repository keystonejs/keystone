import { type PropsWithChildren } from 'react'
import { type BoxProps, Box } from '@keystar/ui/layout'

export const CONTAINER_MAX = 'container.large'

export function Container(props: PropsWithChildren<BoxProps>) {
  return (
    <Box
      minWidth={0} // fix flex overflow issues
      maxWidth={CONTAINER_MAX}
      {...props}
    />
  )
}
