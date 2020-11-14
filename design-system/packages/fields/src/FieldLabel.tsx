/* @jsx jsx */

import { forwardRefWithAs, jsx, useTheme } from '@keystone-ui/core';
import type { ReactNode } from 'react';

type FieldLabelProps = {
  children: ReactNode;
};

export const FieldLabel = forwardRefWithAs<'label', FieldLabelProps>(
  ({ as: Tag = 'label', children, ...props }, ref) => {
    const { typography, fields, spacing } = useTheme();
    return (
      <Tag
        ref={ref}
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
      </Tag>
    );
  }
);
