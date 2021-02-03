/* @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';

import { Link, LinkProps } from '../router';

/**
 * This is the component you should use when linking a Cell to an item (i.e when the Cell supports
 * the linkTo prop)
 */

export const CellLink = (props: LinkProps) => {
  const { colors, spacing } = useTheme();
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
  );
};
