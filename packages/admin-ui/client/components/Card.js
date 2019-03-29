/** @jsx jsx */

import { jsx } from '@emotion/core';
import { gridSize, shadows } from '@arch-ui/theme';

export const Card = ({ elevation, ...props }) => {
  const shadow = shadows[elevation];
  return (
    <div
      css={{
        padding: gridSize * 2,
        background: 'white',
        boxShadow: shadow,
        borderRadius: gridSize,
        marginBottom: gridSize * 3,
      }}
      {...props}
    />
  );
};

Card.defaultProps = {
  elevation: 0,
};
