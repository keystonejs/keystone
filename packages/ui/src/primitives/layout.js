// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Children, cloneElement, type Node } from 'react';
import styled from '@emotion/styled';

import { smOnly } from './media-queries';
import { gridSize } from '../theme';

// ==============================
// Container
// ==============================

export const CONTAINER_WIDTH = 1160;

export const Container = styled.div(({ isFullWidth }) => ({
  marginLeft: 'auto',
  marginRight: 'auto',
  maxWidth: isFullWidth ? '100%' : CONTAINER_WIDTH,
  paddingLeft: gridSize * 6,
  paddingRight: gridSize * 6,
  transition: 'max-width 200ms cubic-bezier(0.2, 0, 0, 1)',

  [smOnly]: {
    paddingLeft: gridSize * 2,
    paddingRight: gridSize * 2,
  },
}));

// ==============================
// Fluid Group
// ==============================

function collapseBorderRadii(index, length) {
  let style;

  const isFirst = index === 0;
  const isLast = index === length - 1;

  if (isLast && !isFirst) {
    style = { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 };
  } else if (isFirst && !isLast) {
    style = { borderTopRightRadius: 0, borderBottomRightRadius: 0 };
  } else if (!isFirst && !isLast) {
    style = { borderRadius: 0 };
  }
  return style;
}

type FlexGroupProps = {
  align: 'stretch' | 'center' | 'flex-start' | 'flex-start',
  children: Array<Node>,
  growIndexes: Array<number>,
  isContiguous?: boolean,
  isInline?: boolean,
  isVertical?: boolean,
  justify: 'space-between' | 'space-around' | 'center' | 'flex-end' | 'flex-start',
  wrap?: boolean,
  spacing: number,
  stretch?: boolean,
  tag: string,
};
export const FlexGroup = ({
  align,
  children,
  growIndexes,
  isContiguous,
  isInline,
  isVertical,
  justify,
  wrap,
  spacing,
  stretch,
  tag: Tag,
  ...props
}: FlexGroupProps) => {
  const gutter = spacing / 2;
  const length = Children.count(children);
  const childArray = Children.toArray(children).filter(child => child); // filter out null and undefined children

  return (
    <Tag
      css={{
        alignItems: align,
        display: isInline ? 'inline-flex' : 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        flexWrap: wrap ? 'wrap' : 'nowrap',
        justifyContent: justify,
        marginBottom: isVertical ? -gutter : null,
        marginLeft: isContiguous || isVertical ? null : -gutter,
        marginRight: isContiguous || isVertical ? null : -gutter,
        marginTop: isVertical ? -gutter : null,
        maxWidth: isInline ? `calc(100% + ${gutter * 2}px)` : null,
      }}
      {...props}
    >
      {childArray.map((child, idx) => {
        const style = isContiguous ? collapseBorderRadii(idx, length) : null;
        const leftOffset = isContiguous && idx ? -1 : gutter;
        const rightOffset = isContiguous ? null : gutter;

        return (
          <div
            key={child.key}
            css={{
              flex: stretch || growIndexes.includes(idx) ? 1 : null,
              marginLeft: isVertical ? null : leftOffset,
              marginRight: isVertical ? null : rightOffset,
              marginTop: isVertical ? gutter : null,
              marginBottom: isVertical ? gutter : null,
              minWidth: 0, // allows text-overflow on children

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
    </Tag>
  );
};

FlexGroup.defaultProps = {
  align: 'stretch',
  growIndexes: [],
  justify: 'flex-start',
  spacing: gridSize,
  tag: 'div',
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
  columns: number,
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
  const gridTemplateColumns = Number.isInteger(columns) ? `repeat(${columns}, 1fr)` : columns;

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

export const Cell = ({ area, height = 1, left, top, width = 1, ...props }: CellProps) => (
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
