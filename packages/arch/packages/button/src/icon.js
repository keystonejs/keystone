/** @jsx jsx */
import { jsx } from '@emotion/core';
import { forwardRef } from 'react';
import { Button } from './primitives';

export const IconButton = forwardRef(({ children, icon: Icon, iconSize = 16, ...props }, ref) => (
  <Button ref={ref} {...props}>
    <span css={{ display: 'flex', alignItems: 'center' }}>
      <Icon size={iconSize} css={children ? { marginRight: '0.5em' } : null} />
      {children}
    </span>
  </Button>
));
