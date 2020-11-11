/* @jsx jsx */

import { ReactNode } from 'react';
import { jsx, useTheme } from '@keystone-ui/core';

/**
 * This is the component you should use when you want the standard padding around a cell value
 */

export const CellContainer = ({ children, ...props }: { children: ReactNode }) => {
  const { spacing } = useTheme();
  return (
    <div css={{ padding: spacing.small }} {...props}>
      {children}
    </div>
  );
};
