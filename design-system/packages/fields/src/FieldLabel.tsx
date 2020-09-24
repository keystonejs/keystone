/* @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import type { ReactNode } from 'react';

type FieldLabelProps = {
  children: ReactNode;
};

export const FieldLabel = ({ children, ...props }: FieldLabelProps) => {
  const { typography, fields } = useTheme();
  return (
    <label
      css={{
        fontWeight: typography.fontWeight.semibold,
        color: fields.labelColor,
        minWidth: 80,
        display: 'inline-block',
      }}
      {...props}
    >
      {children}
    </label>
  );
};
