/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Box, BoxProps } from './Box';
import { forwardRefWithAs } from '../utils';

export const Center = forwardRefWithAs<'div', BoxProps>((props, ref) => {
  return (
    <Box
      ref={ref}
      css={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
      }}
      {...props}
    />
  );
});
