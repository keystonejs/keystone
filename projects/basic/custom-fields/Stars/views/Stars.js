import React from 'react';
const STAR_WIDTH = 22;
const GUTTER = 4;

const calcWidth = n => n * STAR_WIDTH + (n - 1) * GUTTER;

import StarEmpty from './star-empty.svg';
import StarFull from './star-full.svg';

const Stars = ({ count, value, onClick }) => {
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
        .map((_, index) => (
          <img
            src={index >= value ? StarFull : StarEmpty}
            onClick={() => {
              onClick(index === value ? 0 : index);
            }}
          />
        ))}
    </div>
  );
};

Stars.defaultProps = {
  onClick: () => {},
  count: 5,
};

export default Stars;
