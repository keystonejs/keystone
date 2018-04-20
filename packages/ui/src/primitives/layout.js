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

type FlexGroupProps = {
  align: 'stretch' | 'center' | 'flex-start' | 'flex-start',
  children: Node,
  growIndexes: Array<number>,
  isContiguous: boolean,
  isInline: boolean,
  justify:
    | 'space-between'
    | 'space-around'
    | 'center'
    | 'flex-end'
    | 'flex-start',
  spacing: number,
};
export const FlexGroup = ({
  align = 'stretch',
  children,
  growIndexes = [],
  isContiguous,
  isInline,
  justify = 'flex-start',
  spacing = gridSize,
  ...props
}: FlexGroupProps) => {
  const gutter = spacing / 2;
  const length = Children.count(children);

  return (
    <div
      css={{
        display: isInline ? 'inline-flex' : 'flex',
        alignItems: align,
        justifyContent: justify,
        marginLeft: isContiguous ? null : -gutter,
        marginRight: isContiguous ? null : -gutter,
        flexWrap: 'nowrap',
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
              marginLeft: isContiguous && idx ? -1 : gutter,
              marginRight: isContiguous ? null : gutter,

              // bring the focus styles over the top of siblings
              '&:focus-within': {
                position: 'relative',
              },
            }}
          >
            {isContiguous ? cloneElement(child, { style }) : child}
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
