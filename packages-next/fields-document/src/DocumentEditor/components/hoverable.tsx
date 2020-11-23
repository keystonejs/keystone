/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { HTMLAttributes, Ref, forwardRef } from 'react';

export const HoverableElement = forwardRef(
  (props: HTMLAttributes<HTMLElement>, ref: Ref<HTMLElement>) => {
    return (
      <span
        ref={ref}
        contentEditable={false}
        css={{
          display: 'flex',
          marginTop: 8,
          padding: 6,
          background: 'white',
          borderRadius: 6,
          paddingLeft: 10,
          border: '1px solid rgba(0, 0, 0, 0.3)',
          boxShadow: `
0 2.4px 10px rgba(0, 0, 0, 0.09),
0 19px 80px rgba(0, 0, 0, 0.18)`,
          top: 0,
          userSelect: 'none',
        }}
        {...props}
      />
    );
  }
);
