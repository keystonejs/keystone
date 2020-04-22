/** @jsx jsx */

import { jsx } from '@emotion/core';

const STAR_WIDTH = 22;
const GUTTER = 4;

const calcWidth = n => n * STAR_WIDTH + (n - 1) * GUTTER;

import StarEmpty from './star-empty';
import StarFull from './star-full';

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
      {[...Array(count)].map((_, index) => {
        // adding 1 because 0 should render as 0 stars
        let current = index + 1;
        const onClick = () => {
          onChange(current === value ? 0 : current);
        };

        return current <= value ? (
          <StarFull key={current} onClick={onClick} />
        ) : (
          <StarEmpty key={current} onClick={onClick} />
        );
      })}
    </div>
  );
};

export default Stars;
