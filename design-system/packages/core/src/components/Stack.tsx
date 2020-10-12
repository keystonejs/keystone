/** @jsx jsx */

import { Children, Fragment, HTMLAttributes, isValidElement, ReactNode } from 'react';
import { jsx } from '../emotion';
import { Box, BoxProps } from './Box';
import { forwardRefWithAs, mapResponsiveProp } from '../utils';
import { Theme } from '../types';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useTheme } from '../theme';

import { Divider } from './Divider';

const alignment = {
  center: 'center',
  end: 'flex-end',
  start: 'flex-start',
  stretch: 'stretch',
};

const orientationMap = {
  horizontal: {
    flexDirection: 'row',
    marginProperty: 'marginLeft',
    dimension: 'width',
  },
  vertical: {
    flexDirection: 'column',
    marginProperty: 'marginTop',
    dimension: 'height',
  },
} as const;

export type StackProps = {
  /** The value of the "align-items" property. */
  align?: keyof typeof alignment;
  /** Each element in the stack. */
  children: ReactNode;
  /** Causes items in the stack to be oriented horizontally, instead of vertically */
  across?: boolean;
  /** The placement, if any, of the dividing elements. */
  dividers?: 'none' | 'around' | 'between' | 'start' | 'end';
  /** The size of the gap between each element in the stack. */
  gap?: keyof Theme['spacing'];
} & BoxProps;

export const Stack = forwardRefWithAs<'div', StackProps>(
  ({ across, align = 'stretch', children, dividers = 'none', gap = 'none', ...props }, ref) => {
    const { spacing } = useTheme();
    const { mq } = useMediaQuery();

    const orientation = across ? 'horizontal' : 'vertical';
    const { dimension, flexDirection, marginProperty } = orientationMap[orientation];

    return (
      <Box
        ref={ref}
        css={{
          alignItems: alignment[align],
          display: 'flex',
          flexDirection,
          [dimension]: 'fit-content',
        }}
        {...props}
      >
        {['around', 'start'].includes(dividers) && <Divider orientation={orientation} />}
        {Children.map(children, (child, index) => {
          if (!isValidElement(child)) {
            return null;
          }

          return (
            <Fragment>
              {dividers !== 'none' && index ? (
                <Divider
                  orientation={orientation}
                  css={mq({
                    [marginProperty]: index && mapResponsiveProp(gap, spacing),
                  })}
                />
              ) : null}
              <Div
                css={mq({
                  [marginProperty]:
                    (['around', 'start'].includes(dividers) || index) &&
                    mapResponsiveProp(gap, spacing),
                })}
              >
                {child}
              </Div>
            </Fragment>
          );
        })}
        {['around', 'end'].includes(dividers) && (
          <Divider
            orientation={orientation}
            css={mq({
              [marginProperty]: mapResponsiveProp(gap, spacing),
            })}
          />
        )}
      </Box>
    );
  }
);

// min-width and min-height declarations prevent overflow issues
// https://css-tricks.com/preventing-a-grid-blowout/
const Div = (props: HTMLAttributes<HTMLDivElement>) => (
  <div css={{ minHeight: 0, minWidth: 0 }} {...props} />
);
