/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import { ButtonHTMLAttributes, forwardRef } from 'react';

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

type ButtonProps = {
  as?: string;
  isDisabled?: boolean;
  isSelected?: boolean;
  variant?: 'default' | 'action' | 'destructive';
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>;
export const Button = forwardRef<any, ButtonProps>(
  ({ as: Tag = 'button', isDisabled, isSelected, variant = 'default', ...props }, ref) => {
    const extraProps: any = {};
    const { colors, palette, radii, sizing, spacing, typography } = useTheme();

    if (Tag === 'button') {
      extraProps.type = 'button';
    }

    const variants = {
      default: [palette.neutral200, palette.neutral800],
      action: [palette.blue50, palette.blue700],
      destructive: [palette.red50, palette.red700],
    };
    const style = variants[variant];

    return (
      <Tag
        {...extraProps}
        ref={ref}
        disabled={isDisabled}
        data-selected={isSelected}
        css={{
          alignItems: 'center',
          background: 0,
          border: 0,
          borderRadius: radii.xsmall,
          color: style[1],
          cursor: 'pointer',
          display: 'inline-flex',
          fontSize: typography.fontSize.small,
          height: sizing.medium,
          justifyContent: 'center',
          paddingLeft: spacing.small,
          paddingRight: spacing.small,

          ':hover': {
            background: style[0],
          },

          '&:disabled': {
            color: colors.foregroundDisabled,
            pointerEvents: 'none',
          },

          '&:not(:last-of-type)': {
            marginRight: spacing.xsmall,
          },

          '&[data-selected=true]': {
            background: colors.foregroundMuted,
            color: colors.background,
          },
        }}
        {...props}
      />
    );
  }
);
