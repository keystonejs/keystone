/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '../emotion'

import { useTheme } from '../theme'
import { type ResponsiveProp, type Theme } from '../types'
import { Box, type MarginProps } from './Box'

type ColorType = ResponsiveProp<keyof Theme['palette']>

const orientationMap = {
  horizontal: 'width',
  vertical: 'height',
}

type DividerProps = {
  children?: never
  color?: ColorType
  orientation?: keyof typeof orientationMap
  className?: string
} & MarginProps

export const Divider = ({ orientation = 'vertical', color, ...props }: DividerProps) => {
  const { colors } = useTheme()

  const dimension = orientationMap[orientation]
  const styles = {
    // default the background color to the theme border color
    backgroundColor: color ? undefined : colors.border,
    flexShrink: 0,
    [dimension]: 1,
  }

  // if the color prop is defined, pass it as the background to the box
  return <Box css={styles} background={color} {...props} />
}
