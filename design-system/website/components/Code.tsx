/** @jsxRuntime classic */
/** @jsx jsx */

import { ReactNode } from 'react';
import { jsx, useTheme } from '@keystone-ui/core';

export const Code = ({ children }: { children: ReactNode }) => {
  const { palette, spacing, radii } = useTheme();
  return (
    <code
      css={{
        color: palette.neutral700,
        background: palette.neutral100,
        padding: spacing.xsmall,
        borderRadius: radii.small,
      }}
    >
      {children}
    </code>
  );
};
