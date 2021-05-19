/* @jsx jsx */

import { ReactNode } from 'react';
import { jsx, forwardRefWithAs } from '@keystone-ui/core';

type FieldContainerProps = {
  children: ReactNode;
};

export const FieldContainer = forwardRefWithAs<'div', FieldContainerProps>(
  ({ as: Tag = 'div', children, ...props }, ref) => {
    return (
      <Tag ref={ref} {...props}>
        {children}
      </Tag>
    );
  }
);
