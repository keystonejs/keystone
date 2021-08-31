/** @jsxRuntime classic */
/** @jsx jsx */

import { ButtonHTMLAttributes, HTMLAttributes, createContext, useContext, ReactNode } from 'react';
import { Box, MarginProps, forwardRefWithAs, jsx, useTheme } from '@keystone-ui/core';

// Spacers and Separators
// ------------------------------

export const ToolbarSpacer = () => {
  const { spacing } = useTheme();

  return <span css={{ display: 'inline-block', width: spacing.large }} />;
};
export const ToolbarSeparator = () => {
  const { colors, spacing } = useTheme();

  return (
    <span
      css={{
        alignSelf: 'stretch',
        background: colors.border,
        display: 'inline-block',
        marginLeft: spacing.xsmall,
        marginRight: spacing.xsmall,
        width: 1,
      }}
    />
  );
};

// Groups
// ------------------------------

const autoFlowDirection = {
  column: 'row',
  row: 'column',
};
type DirectionType = keyof typeof autoFlowDirection;

const ToolbarGroupContext = createContext<{ direction: DirectionType }>({ direction: 'row' });
const useToolbarGroupContext = () => useContext(ToolbarGroupContext);

type ToolbarGroupProps = { direction?: DirectionType } & MarginProps &
  HTMLAttributes<HTMLDivElement>;
export const ToolbarGroup = forwardRefWithAs<'div', ToolbarGroupProps>(
  ({ children, direction = 'row', ...props }, ref) => {
    const { spacing } = useTheme();
    return (
      <ToolbarGroupContext.Provider value={{ direction }}>
        <Box
          ref={ref}
          css={{
            display: 'inline-grid',
            gap: spacing.xxsmall,
            gridAutoFlow: autoFlowDirection[direction],
          }}
          {...props}
        >
          {children}
        </Box>
      </ToolbarGroupContext.Provider>
    );
  }
);

// Buttons
// ------------------------------

type ToolbarButtonProps = {
  as?: string;
  isDisabled?: boolean;
  isPressed?: boolean;
  isSelected?: boolean;
  variant?: 'default' | 'action' | 'destructive';
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>;
export const ToolbarButton = forwardRefWithAs<'button', ToolbarButtonProps>(function ToolbarButton(
  { as: Tag = 'button', isDisabled, isPressed, isSelected, variant = 'default', ...props },
  ref
) {
  const extraProps: any = {};
  const { direction: groupDirection } = useToolbarGroupContext();
  const { colors, palette, radii, sizing, spacing, typography } = useTheme();

  if (Tag === 'button') {
    extraProps.type = 'button';
  }

  const variants = {
    default: {
      bgHover: palette.neutral200,
      bgActive: palette.neutral300,
      fg: palette.neutral800,
    },
    action: { bgHover: palette.blue50, bgActive: palette.blue100, fg: palette.blue600 },
    destructive: { bgHover: palette.red50, bgActive: palette.red100, fg: palette.red600 },
  };
  const style = variants[variant];

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
          color: colors.foregroundDisabled,
          pointerEvents: 'none',
        },

        '&[data-pressed=true]': {
          background: style.bgActive,
        },
        '&[data-selected=true]': {
          background: colors.foregroundMuted,
          color: colors.background,
        },

        // alternate styles within button group
        '&[data-display-mode=row]': {
          paddingLeft: spacing.small,
          paddingRight: spacing.small,
        },
        '&[data-display-mode=column]': {
          paddingLeft: spacing.medium,
          paddingRight: spacing.medium,
        },
      }}
      {...props}
    />
  );
});

export function KeyboardInTooltip({ children }: { children: ReactNode }) {
  const theme = useTheme();
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
  );
}
