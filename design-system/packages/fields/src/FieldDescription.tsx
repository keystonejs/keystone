/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';

type FieldDescriptionProps = {
  id: string;
  children: string | null;
};

export const FieldDescription = (props: FieldDescriptionProps) => {
  const { spacing } = useTheme();
  if (props.children === null) {
    return null;
  }
  return (
    <span
      css={{
        color: '#667092',
        display: 'block',
        marginBottom: spacing.xsmall,
        minWidth: 120,
      }}
      {...props}
    />
  );
};
