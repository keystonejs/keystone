/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';

type FieldDescriptionProps = {
  id: string;
  children: string | null;
};

export const FieldDescription = (props: FieldDescriptionProps) => {
  const { spacing, palette } = useTheme();
  if (props.children === null) {
    return null;
  }
  return (
    <div
      css={{
        color: palette.neutral700,
        marginBottom: spacing.small,
        minWidth: 120,
      }}
      {...props}
    />
  );
};
