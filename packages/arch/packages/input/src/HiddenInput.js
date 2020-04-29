/** @jsx jsx */
import { jsx } from '@emotion/core';
import { forwardRef } from 'react';

// Hidden Input
// ------------------------------

export const HiddenInput = forwardRef((props, ref) => (
  <input ref={ref} css={{ display: 'none' }} {...props} />
));
