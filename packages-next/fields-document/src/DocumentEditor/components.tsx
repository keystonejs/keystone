/** @jsx jsx */

import { ButtonHTMLAttributes, HTMLAttributes, createContext, useContext } from 'react';
import { Box, MarginProps, forwardRefWithAs, jsx, useTheme } from '@keystone-ui/core';

export const Spacer = () => {
  const { spacing } = useTheme();

  return <span css={{ display: 'inline-block', width: spacing.large }} />;
};
export const Separator = () => {
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

// Buttons may be displayed in a row of icons or in a column of labelled menu items

const ButtonGroupContext = createContext({ direction: 'row' });
export const useButtonGroupContext = () => useContext(ButtonGroupContext);

const autoFlowDirection = {
  row: 'column',
  column: 'row',
};
export const ButtonGroup = forwardRefWithAs<
  'div',
  { direction?: 'column' | 'row' } & MarginProps & HTMLAttributes<HTMLDivElement>
>(({ direction = 'row', ...props }, ref) => {
  const { spacing } = useTheme();

  return (
    <ButtonGroupContext.Provider value={{ direction }}>
      <Box
        ref={ref}
        css={{
          display: 'inline-grid',
          gap: spacing.xxsmall,
          gridAutoFlow: autoFlowDirection[direction],
        }}
        {...props}
      />
    </ButtonGroupContext.Provider>
  );
});

type ButtonProps = {
  as?: string;
  isDisabled?: boolean;
  isPressed?: boolean;
  isSelected?: boolean;
  variant?: 'default' | 'action' | 'destructive';
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>;
export const Button = forwardRefWithAs<'button', ButtonProps>(
  (
    { as: Tag = 'button', isDisabled, isPressed, isSelected, variant = 'default', ...props },
    ref
  ) => {
    const extraProps: any = {};
    const { direction: groupDirection } = useButtonGroupContext();
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
  }
);
