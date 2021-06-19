/** @jsx jsx  */
import { jsx } from '@emotion/react';

import { useMediaQuery } from '../../lib/media';
import { DocsNavigation, UpdatesNavigation } from './Navigation';

export function Sidebar({ isUpdatesPage, releases }) {
  const mq = useMediaQuery();
  const Navigation = isUpdatesPage ? UpdatesNavigation : DocsNavigation;

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
        <Navigation releases={releases} />
      </div>
    </aside>
  );
}
