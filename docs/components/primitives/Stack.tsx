/** @jsx jsx */
import { jsx } from '@emotion/react';
import { HTMLAttributes } from 'react';

import { SPACE } from '../../lib/TOKENS';

const gapMap: Record<number, string> = {};
Object.keys(SPACE).forEach((name, i) => {
  gapMap[i + 1] = `var(${name})`;
});

type StackProps = {
  block?: boolean;
  gap?: number;
  orientation?: 'vertical' | 'horizontal';
} & HTMLAttributes<HTMLElement>;

export function Stack({ gap = 4, orientation = 'vertical', block, ...props }: StackProps) {
  return (
    <div
      css={{
        display: block ? 'grid' : 'inline-grid',
        mozBoxAlign: 'stretch',
        placeItems: 'stretch',
        gap: gapMap[gap],
        gridAutoFlow: orientation === 'vertical' ? 'row' : 'column',
        minHeight: 0,
        minWidth: 0,
        alignItems: 'center',
      }}
      {...props}
    />
  );
}
