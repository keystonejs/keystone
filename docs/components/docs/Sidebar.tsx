/** @jsxRuntime classic */
/** @jsx jsx  */
import { jsx } from '@emotion/react';

import { useMediaQuery } from '../../lib/media';
import { DocsNavigation, UpdatesNavigation } from './Navigation';

type SidebarProps = {
  isUpdatesPage?: boolean;
};

export function Sidebar({ isUpdatesPage }: SidebarProps) {
  const mq = useMediaQuery();
  const Navigation = isUpdatesPage ? UpdatesNavigation : DocsNavigation;

  return (
    <aside
      css={mq({
        fontSize: 'var(--font-xsmall)',
      })}
    >
      <div
        id="skip-link-navigation"
        tabIndex={0}
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
