/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import { HTMLAttributes, forwardRef } from 'react';

export const Hoverable = forwardRef<HTMLDivElement, HTMLAttributes<HTMLElement>>((props, ref) => {
  const { radii, spacing } = useTheme();

  return (
    <div
      ref={ref}
      contentEditable={false}
      css={{
        background: 'white',
        borderRadius: radii.small,
        boxShadow: `rgba(9, 30, 66, 0.31) 0px 0px 1px, rgba(9, 30, 66, 0.25) 0px 4px 8px -2px`,
        padding: spacing.small,
        position: 'absolute',
        userSelect: 'none',
        zIndex: 1,
      }}
      {...props}
    />
  );
});
