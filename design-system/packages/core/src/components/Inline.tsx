/** @jsx jsx */

import { Children, ReactNode } from 'react';
import { jsx } from '../emotion';

import { Box, BoxProps } from './Box';
import { forwardRefWithAs } from '../utils';
import { Theme } from '../types';
import { useTheme } from '../theme';

const alignment = {
  center: 'center',
  end: 'flex-end',
  start: 'flex-start',
  stretch: 'stretch',
};

type InlineProps = {
  /** The value of the "align-items" property. */
  align?: keyof typeof alignment;
  /** Each item in the container. */
  children: ReactNode;
  /** The size of the gap between each item. */
  gap?: keyof Theme['spacing'];
} & BoxProps;

export const Inline = forwardRefWithAs<'div', InlineProps>(
  ({ align = 'start', children, gap = 'none', ...props }, ref) => {
    const { spacing } = useTheme();
    const resolvedAlign = alignment[align];
    const resolvedGap = spacing[gap];

    return (
      <Box
        css={{
          alignItems: resolvedAlign,
          display: 'flex',
          flexWrap: 'wrap',
          marginLeft: -resolvedGap,
          marginTop: -resolvedGap,
        }}
        ref={ref}
        {...props}
      >
        {Children.map(children, child =>
          child !== null && child !== undefined ? (
            <div
              css={{
                display: 'flex',
                flexWrap: 'wrap',
                paddingLeft: resolvedGap,
                paddingTop: resolvedGap,
              }}
            >
              {child}
            </div>
          ) : null
        )}
      </Box>
    );
  }
);
