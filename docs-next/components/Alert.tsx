/** @jsx jsx */
import { ReactNode } from 'react';
import { jsx, Box } from '@keystone-ui/core';

export function Alert({ children }: { children: ReactNode }) {
  return (
    <Box padding="medium" rounding="medium" foreground="yellow900" background="yellow50">
      <span
        css={{
          display: 'inline-block',
          padding: '0 1rem 0 0',
        }}
        aria-label="For your information"
      >
        💡
      </span>
      <p
        css={{
          display: 'inline',
          margin: '0 !important',
        }}
      >
        {children}
      </p>
    </Box>
  );
}
