/** @jsx jsx */

import { jsx } from '../emotion';

import { Box, BoxProps } from './Box';
import { forwardRefWithAs } from '../utils';

type CenterProps = {
  fillView?: boolean;
} & BoxProps;

export const Center = forwardRefWithAs<'div', CenterProps>(
  ({ fillView = false, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        css={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          height: fillView ? '100vh' : undefined,
          width: fillView ? '100vw' : undefined,
        }}
        {...props}
      />
    );
  }
);
