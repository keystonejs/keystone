/* @jsx jsx */

import { ComponentPropsWithoutRef } from 'react';
import { jsx } from '@keystone-ui/core';

/**
 * NOTE: should probably come from the DS?
 */
type ContainerProps = ComponentPropsWithoutRef<'div'>;
export const Container = ({ children, ...props }: ContainerProps) => (
  <div
    css={{
      minWidth: 0, // fix flex text truncation
      maxWidth: 1080,
      // marginLeft: 'auto',
      // marginRight: 'auto',
    }}
    {...props}
  >
    {children}
  </div>
);
