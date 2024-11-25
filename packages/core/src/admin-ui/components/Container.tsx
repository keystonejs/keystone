import React from 'react'
import { type PropsWithChildren } from 'react'
import { type BoxProps, Box } from '@keystar/ui/layout'

export function Container (props: PropsWithChildren<BoxProps>) {
  return <Box
    minWidth={0} // fix flex overflow issues
    maxWidth="container.large"
    {...props}
  />
}
