/* @jsx jsx */

import { ReactNode } from 'react';
import { jsx } from '@keystone-ui/core';

/**
 * NOTE: should probably come from the DS?
 */

export const Container = ({ children, ...props }: { children: ReactNode }) => {
  return (
    <div
      css={{
        minWidth: 0, // fix flex text truncation
        maxWidth: 1024,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
      {...props}
    >
      {children}
    </div>
  );
};
