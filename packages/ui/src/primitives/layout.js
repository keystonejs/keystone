// @flow

import React, { Children, type Node } from 'react';
import styled from 'react-emotion';

import { smOnly } from './media-queries';
import { gridSize } from '../theme';

// ==============================
// Container
// ==============================

export const Container = styled.div({
  marginLeft: 'auto',
  marginRight: 'auto',
  maxWidth: 1160,
  paddingLeft: 30,
  paddingRight: 30,

  [smOnly]: {
    paddingLeft: 15,
    paddingRight: 15,
  },
});

// ==============================
// Fluid Group
// ==============================

type FluidGroupProps = {
  children: Node,
  growIndexes: Array<number>,
  isInline: boolean,
  spacing: number,
};
export const FluidGroup = ({
  children,
  growIndexes = [],
  isInline,
  spacing = gridSize,
  ...props
}: FluidGroupProps) => {
  const gutter = spacing / 2;
  return (
    <div
      css={{
        display: isInline ? 'inline-flex' : 'flex',
        marginLeft: -gutter,
        marginRight: -gutter,
      }}
      {...props}
    >
      {Children.map(children, (c, i) => (
        <div
          css={{
            flex: growIndexes.includes(i) ? 1 : null,
            marginLeft: gutter,
            marginRight: gutter,
          }}
        >
          {c}
        </div>
      ))}
    </div>
  );
};
