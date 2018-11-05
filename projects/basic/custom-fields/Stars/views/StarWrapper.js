import React from 'react';
const STAR_WIDTH = 22;
const GUTTER = 4;

const calcWidth = n => n * STAR_WIDTH + (n - 1) * GUTTER;

export default ({ starCount, children }) => (
  <div
    style={{
      display: 'inline-flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: calcWidth(starCount),
    }}
    children={children}
  />
);
