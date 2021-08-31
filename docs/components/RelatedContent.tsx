/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import { ReactNode } from 'react';

import { useMediaQuery } from '../lib/media';

export function RelatedContent({ children }: { children: ReactNode }) {
  const mq = useMediaQuery();

  return (
    <div
      css={mq({
        display: 'grid',
        gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
        gap: 'var(--space-xlarge)',
        '> a > p > p > code': {
          textDecoration: 'none',
        },
      })}
    >
      {children}
    </div>
  );
}
