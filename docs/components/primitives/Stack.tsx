/** @jsx jsx */
import { jsx } from '@keystone-ui/core';

import { SPACE } from '../../lib/TOKENS';

const gapMap = {};
Object.keys(SPACE).forEach((name, i) => {
  gapMap[i + 1] = `var(${name})`;
});

export function Stack({ gap = 4, orientation = 'vertical', ...props }) {
  return (
    <div
      css={{
        display: 'inline-grid',
        mozBoxAlign: 'stretch',
        placeItems: 'stretch',
        gap: gapMap[gap],
        gridAutoFlow: orientation === 'vertical' ? 'row' : 'column',
        width: '-moz-fit-content',
        minHeight: 0,
        minWidth: 0,
      }}
      {...props}
    />
  );
}
