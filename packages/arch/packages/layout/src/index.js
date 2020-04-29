/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Children, cloneElement, forwardRef } from 'react';
import styled from '@emotion/styled';

import { mediaQueries } from '@arch-ui/common';
import { gridSize } from '@arch-ui/theme';

// ==============================
// Container
// ==============================

export const CONTAINER_WIDTH = 1160;
export const CONTAINER_GUTTER = gridSize * 6;

export const Container = styled.div(({ isFullWidth }) => ({
  maxWidth: isFullWidth ? '100%' : CONTAINER_WIDTH,
  paddingLeft: CONTAINER_GUTTER,
  paddingRight: CONTAINER_GUTTER,
  transition: 'max-width 200ms cubic-bezier(0.2, 0, 0, 1)',

  [mediaQueries.smOnly]: {
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

export function FlexGroupComponent(
  {
    align = 'stretch',
    as: Tag = 'div',
    children,
    growIndexes = [],
    isContiguous,
    isInline,
    isVertical,
    justify = 'flex-start',
    wrap,
    spacing = gridSize,
    stretch,
    ...props
  },
  ref
) {
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
      ref={ref}
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
}

export const FlexGroup = forwardRef(FlexGroupComponent);

// ==============================
// Grid
// ==============================

// Grid Parent
// --------------------

function formatAreas(areas) {
  return areas.map(area => `"${area}"`).join(' ');
}

export const Grid = forwardRef(
  (
    {
      alignContent,
      areas,
      columns = 12,
      flow = 'row',
      gap = 8,
      justifyContent,
      minRowHeight = 20,
      rows,
      ...props
    },
    ref
  ) => {
    const templateRows = rows ? { gridTemplateRows: rows } : {};
    const templateAreas = areas ? { gridTemplateAreas: formatAreas(areas) } : {};
    const gridTemplateColumns = Number.isInteger(columns) ? `repeat(${columns}, 1fr)` : columns;

    return (
      <div
        ref={ref}
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
  }
);

export const Cell = ({ area, height = 1, left, top, width = 1, ...props }) => (
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
