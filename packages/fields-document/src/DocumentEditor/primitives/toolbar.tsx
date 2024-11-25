/** @jsxRuntime classic */
/** @jsx jsx */

import { tokenSchema } from '@keystar/ui/style'

import { type ButtonHTMLAttributes, type HTMLAttributes, createContext, useContext, type ReactNode } from 'react'
import { Box, type MarginProps, forwardRefWithAs, jsx, useTheme } from '@keystone-ui/core'

// Spacers and Separators
// ------------------------------

export const ToolbarSpacer = () => {
  const { spacing } = useTheme()

  return <span css={{ display: 'inline-block', width: spacing.large }} />
}
export const ToolbarSeparator = () => {
  const { spacing } = useTheme()

  return (
    <span
      css={{
        alignSelf: 'stretch',
        background: tokenSchema.color.border.neutral,
        display: 'inline-block',
        marginLeft: spacing.xsmall,
        marginRight: spacing.xsmall,
        width: 1,
      }}
    />
  )
}

// Groups
// ------------------------------

type DirectionType = 'row' | 'column'

const directionToAlignment = {
  row: 'center',
  column: 'start',
}

const ToolbarGroupContext = createContext<{ direction: DirectionType }>({ direction: 'row' })
const useToolbarGroupContext = () => useContext(ToolbarGroupContext)

type ToolbarGroupProps = { direction?: DirectionType } & MarginProps &
  HTMLAttributes<HTMLDivElement>
export const ToolbarGroup = forwardRefWithAs<'div', ToolbarGroupProps>(
  ({ children, direction = 'row', ...props }, ref) => {
    const { spacing } = useTheme()
    return (
      <ToolbarGroupContext.Provider value={{ direction }}>
        <Box
          ref={ref}
          css={{
            display: 'flex',
            gap: spacing.xxsmall,
            flexDirection: direction,
            justifyContent: 'start',
            alignItems: directionToAlignment[direction],
            height: '100%',
            overflowX: 'auto',
          }}
          {...props}
        >
          {children}
        </Box>
      </ToolbarGroupContext.Provider>
    )
  }
)

// Buttons
// ------------------------------

type ToolbarButtonProps = {
  as?: string
  isDisabled?: boolean
  isPressed?: boolean
  isSelected?: boolean
  variant?: 'default' | 'action' | 'destructive'
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>
export const ToolbarButton = forwardRefWithAs<'button', ToolbarButtonProps>(function ToolbarButton (
  { as: Tag = 'button', isDisabled, isPressed, isSelected, variant = 'default', ...props },
  ref
) {
  const extraProps: any = {}
  const { direction: groupDirection } = useToolbarGroupContext()
  const { radii, sizing, spacing, typography } = useTheme()

  if (Tag === 'button') {
    extraProps.type = 'button'
  }

  const variants = {
    default: {
      bgHover: tokenSchema.color.alias.backgroundHovered,
      bgActive: tokenSchema.color.alias.backgroundPressed,
      fg: tokenSchema.color.alias.foregroundIdle,
    },
    action: {
      bgHover: tokenSchema.color.scale.indigo3,
      bgActive: tokenSchema.color.scale.indigo4,
      fg: tokenSchema.color.foreground.accent
    },
    destructive: {
      bgHover: tokenSchema.color.scale.red3,
      bgActive: tokenSchema.color.scale.red4,
      fg: tokenSchema.color.foreground.critical
    },
  }
  const style = variants[variant]

  return (
    <Tag
      {...extraProps}
      ref={ref}
      disabled={isDisabled}
      data-pressed={isPressed}
      data-selected={isSelected}
      data-display-mode={groupDirection}
      css={{
        alignItems: 'center',
        background: 0,
        border: 0,
        borderRadius: radii.xsmall,
        color: style.fg,
        cursor: 'pointer',
        display: 'flex',
        fontSize: typography.fontSize.small,
        fontWeight: typography.fontWeight.medium,
        height: sizing.medium,
        whiteSpace: 'nowrap',

        ':hover': {
          background: style.bgHover,
        },
        ':active': {
          background: style.bgActive,
        },

        '&:disabled': {
          color: tokenSchema.color.alias.foregroundDisabled,
          pointerEvents: 'none',
        },

        '&[data-pressed=true]': {
          background: style.bgActive,
        },
        '&[data-selected=true]': {
          background: tokenSchema.color.alias.backgroundSelected,
          color: tokenSchema.color.alias.foregroundSelected,
        },

        // alternate styles within button group
        '&[data-display-mode=row]': {
          paddingLeft: spacing.small,
          paddingRight: spacing.small,
        },
        '&[data-display-mode=column]': {
          paddingLeft: spacing.medium,
          paddingRight: spacing.medium,
          width: '100%',
        },
      }}
      {...props}
    />
  )
})

export function KeyboardInTooltip ({ children }: { children: ReactNode }) {
  const theme = useTheme()
  return (
    <kbd
      css={{
        margin: 2,
        padding: theme.spacing.xxsmall,
        fontFamily: 'inherit',
        backgroundColor: theme.colors.foreground,
        borderRadius: theme.radii.xsmall,
        color: theme.colors.background,
        whiteSpace: 'pre',
      }}
    >
      {children}
    </kbd>
  )
}
