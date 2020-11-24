/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import { HTMLAttributes, forwardRef } from 'react';

type Props = {
  placement?: 'center' | 'left' | 'right';
} & HTMLAttributes<HTMLElement>;

export const Hoverable = forwardRef<HTMLDivElement, Props>(
  ({ placement = 'center', ...props }, ref) => {
    const { radii, spacing } = useTheme();
    const placements = {
      center: {
        left: '50%',
        transform: `translateX(-50%)`,
      },
      left: {
        left: 0,
      },
      right: {
        right: 0,
      },
    };

    return (
      <div
        ref={ref}
        contentEditable={false}
        css={{
          background: 'white',
          borderRadius: radii.small,
          boxShadow: `rgba(9, 30, 66, 0.31) 0px 0px 1px, rgba(9, 30, 66, 0.25) 0px 4px 8px -2px`,
          marginTop: spacing.xsmall,
          padding: spacing.small,
          position: 'absolute',
          top: '100%',
          userSelect: 'none',
          zIndex: 1,
          ...placements[placement],
        }}
        {...props}
      />
    );
  }
);
