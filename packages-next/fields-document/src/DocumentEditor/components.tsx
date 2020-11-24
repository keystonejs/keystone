/** @jsx jsx */

import { ButtonHTMLAttributes, HTMLAttributes, createContext, forwardRef, useContext } from 'react';
import { jsx, useTheme } from '@keystone-ui/core';

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
        marginLeft: spacing.small,
        marginRight: spacing.small,
        width: 1,
      }}
    />
  );
};

// Buttons may be displayed in a row of icons or in a column of labelled menu items

const ButtonGroupContext = createContext({ direction: 'row' });
export const useButtonGroupContext = () => useContext(ButtonGroupContext);

export const ButtonGroup = ({
  direction = 'row',
  ...props
}: { direction?: 'column' | 'row' } & HTMLAttributes<HTMLDivElement>) => {
  return (
    <ButtonGroupContext.Provider value={{ direction }}>
      <div css={{ display: 'flex', flexDirection: direction }} {...props} />
    </ButtonGroupContext.Provider>
  );
};

type ButtonProps = {
  as?: string;
  isDisabled?: boolean;
  isSelected?: boolean;
  variant?: 'default' | 'action' | 'destructive';
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>;
export const Button = forwardRef<any, ButtonProps>(
  ({ as: Tag = 'button', isDisabled, isSelected, variant = 'default', ...props }, ref) => {
    const extraProps: any = {};
    const { direction: groupDirection } = useButtonGroupContext();
    const { colors, palette, radii, sizing, spacing, typography } = useTheme();

    if (Tag === 'button') {
      extraProps.type = 'button';
    }

    const variants = {
      default: [palette.neutral200, palette.neutral800],
      action: [palette.blue50, palette.blue600],
      destructive: [palette.red50, palette.red600],
    };
    const style = variants[variant];

    return (
      <Tag
        {...extraProps}
        ref={ref}
        disabled={isDisabled}
        data-selected={isSelected}
        data-display-mode={groupDirection}
        css={{
          alignItems: 'center',
          background: 0,
          border: 0,
          borderRadius: radii.xsmall,
          color: style[1],
          cursor: 'pointer',
          display: 'flex',
          fontSize: typography.fontSize.small,
          fontWeight: typography.fontWeight.medium,
          height: sizing.medium,
          // justifyContent: 'center',
          paddingLeft: spacing.small,
          paddingRight: spacing.small,
          whiteSpace: 'nowrap',

          ':hover': {
            background: style[0],
          },

          '&:disabled': {
            color: colors.foregroundDisabled,
            pointerEvents: 'none',
          },

          '&[data-selected=true]': {
            background: colors.foregroundMuted,
            color: colors.background,
          },

          // alternate styles within button group
          '&[data-display-mode=row]': {
            // really want flex-gap...
            '&:not(:last-of-type)': {
              marginRight: spacing.xsmall,
            },
          },
          '&[data-display-mode=column]': {
            // really want flex-gap...
            '&:not(:last-of-type)': {
              marginBottom: spacing.xsmall,
            },
          },
        }}
        {...props}
      />
    );
  }
);
