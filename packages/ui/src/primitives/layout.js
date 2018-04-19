// @flow

import React, { Children, cloneElement, type Node } from 'react';
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
        alignItems: 'center',
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

// ==============================
// Contiguous Group
// ==============================

type ContiguousGroupProps = {
  children: Node,
  growIndexes: Array<number>,
  isInline: boolean,
  spacing: number,
};
export const ContiguousGroup = ({
  children,
  growIndexes = [],
  isInline,
  ...props
}: ContiguousGroupProps) => {
  const length = Children.count(children);
  return (
    <div
      css={{
        display: isInline ? 'inline-flex' : 'flex',
      }}
      {...props}
    >
      {Children.map(children, (child, idx) => {
        let style;

        const isFirst = idx === 0;
        const isLast = idx === length - 1;

        if (isLast && !isFirst) {
          style = { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 };
        } else if (isFirst && !isLast) {
          style = { borderTopRightRadius: 0, borderBottomRightRadius: 0 };
        } else if (!isFirst && !isLast) {
          style = { borderRadius: 0 };
        }

        return (
          <div
            css={{
              flex: growIndexes.includes(idx) ? 1 : null,
              marginLeft: idx ? -1 : null,

              // bring the focus styles over the top of siblings
              '&:focus-within': {
                position: 'relative',
              },
            }}
          >
            {cloneElement(child, { style })}
          </div>
        );
      })}
    </div>
  );
};

// ==============================
// Grid
// ==============================

// Grid Parent
// --------------------

function formatAreas(areas) {
  return areas.map(area => `"${area}"`).join(' ');
}

type GridProps = {
  alignContent: string,
  areas: Array<string>,
  columns: string | number,
  flow: string,
  gap: number,
  justifyContent: string,
  minRowHeight: number,
  rows: string,
};

export const Grid = ({
  alignContent,
  areas,
  columns = 12,
  flow = 'row',
  gap = 8,
  justifyContent,
  minRowHeight = 20,
  rows,
  ...props
}: GridProps) => {
  const templateRows = rows ? { gridTemplateRows: rows } : {};
  const templateAreas = areas ? { gridTemplateAreas: formatAreas(areas) } : {};
  const gridTemplateColumns = Number.isInteger(columns)
    ? `repeat(${columns}, 1fr)`
    : columns;

  return (
    <div
      css={{
        display: 'grid',
        gridAutoFlow: flow,
        gridAutoRows: `minmax(${minRowHeight}px, auto)`,
        gridGap: gap,
        gridTemplateColumns,
        justifyContent,
        alignContent,
        ...templateRows,
        ...templateAreas,
      }}
      {...props}
    />
  );
};

// Cell
// ------------------------------

type CellProps = {
  area: string,
  center: boolean,
  height: number,
  left: number | string,
  middle: boolean,
  top: number | string,
  width: number,
};

export const Cell = ({
  area,
  height = 1,
  left,
  top,
  width = 1,
  ...props
}: CellProps) => (
  <div
    css={{
      alignContent: 'space-around',
      gridArea: area,
      gridColumnEnd: `span ${width}`,
      gridColumnStart: left,
      gridRowEnd: `span ${height}`,
      gridRowStart: top,
      height: '100%',
      minWidth: 0,
    }}
    {...props}
  />
);
