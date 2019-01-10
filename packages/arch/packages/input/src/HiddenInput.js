// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';

// Hidden Input
// ------------------------------

export const HiddenInput = ({ innerRef, ...props }: { innerRef?: React.Ref<'input'> }) => (
  <input
    ref={innerRef}
    tabIndex="-1"
    css={{
      border: 0,
      clip: 'rect(1px, 1px, 1px, 1px)',
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
);
