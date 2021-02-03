import React from 'react';
const STAR_WIDTH = 22;
const GUTTER = 4;

const calcWidth = n => n * STAR_WIDTH + (n - 1) * GUTTER;

import StarEmpty from './star-empty.svg';
import StarFull from './star-full.svg';

const Stars = ({ count = 5, value, onChange = () => {} }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: calcWidth(count),
      }}
    >
      {Array(count)
        .fill(true)
        .map((_, index) => {
          // adding 1 because 0 should render as 0 stars
          let current = index + 1;
          return (
            <img
              key={index}
              src={current <= value ? StarFull : StarEmpty}
              onClick={() => {
                onChange(current === value ? 0 : current);
              }}
            />
          );
        })}
    </div>
  );
};

export default Stars;
