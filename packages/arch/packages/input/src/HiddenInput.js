/** @jsx jsx */
import { jsx } from '@emotion/core';
import { forwardRef } from 'react';

// Hidden Input
// ------------------------------

export const HiddenInput = forwardRef((props, ref) => (
  <input
    ref={ref}
    tabIndex="-1"
    css={{
      display: 'none',
      border: 0,
      height: 1,
      margin: 0,
      opacity: 0,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      whiteSpace: 'nowrap',
      width: 1,
    }}
    {...props}
  />
));
