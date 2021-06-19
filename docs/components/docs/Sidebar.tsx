/** @jsx jsx  */
import { jsx } from '@emotion/react';

import { useMediaQuery } from '../../lib/media';
import { Navigation } from './Navigation';

export function Sidebar() {
  const mq = useMediaQuery();

  return (
    <aside
      css={mq({
        fontSize: 'var(--font-xsmall)',
      })}
    >
      <div
        css={mq({
          display: ['none', null, 'block'],
          padding: ['0 0 var(--space-large) var(--space-large)', null, 0],
          borderBottom: ['1px solid var(--muted)', null, 'none'],
        })}
      >
        <Navigation />
      </div>
    </aside>
  );
}
