/* @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import type { ReactNode } from 'react';

type FieldLabelProps = {
  children: ReactNode;
};

export const FieldLabel = ({ children, ...props }: FieldLabelProps) => {
  const { typography, fields, spacing } = useTheme();
  return (
    <label
      css={{
        color: fields.labelColor,
        display: 'block',
        fontWeight: typography.fontWeight.semibold,
        marginBottom: spacing.xsmall,
        minWidth: 120,
      }}
      {...props}
    >
      {children}
    </label>
  );
};
