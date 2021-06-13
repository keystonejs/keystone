/** @jsx jsx  */
import { jsx } from '@keystone-ui/core';
import { useState } from 'react';

import { useMediaQuery } from '../../lib/media';
import { Navigation } from './Navigation';

export function Sidebar() {
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(true);
  const mq = useMediaQuery();

  return (
    <aside
      css={mq({
        fontSize: 'var(--font-xsmall)',
        borderBottom: ['1px solid var(--muted)', null, 'none'],
      })}
    >
      {mobileNavCollapsed ? (
        <button
          onClick={() => setMobileNavCollapsed(false)}
          css={mq({
            display: ['block', null, 'none'],
            fontWeight: 600,
            fontSize: 'var(--font-small)',
            padding: 'var(--space-large)',
            width: '100%',
            textAlign: 'left',
            background: 'transparent',
            appearance: 'none',
            boxShadow: 'none',
          })}
        >
          Show Nav
        </button>
      ) : null}
      <div
        css={mq({
          display: [mobileNavCollapsed ? 'none' : 'block', null, 'block'],
          marginTop: 'var(--space-xlarge)',
          padding: ['0 0 var(--space-large) var(--space-large)', null, 0],
          borderBottom: ['1px solid var(--muted)', null, 'none'],
        })}
      >
        <Navigation />
      </div>
      {!mobileNavCollapsed ? (
        <button
          onClick={() => setMobileNavCollapsed(true)}
          css={mq({
            display: ['block', null, 'none'],
            fontWeight: 600,
            fontSize: 'var(--font-small)',
            padding: 'var(--space-large)',
            width: '100%',
            textAlign: 'left',
            background: 'transparent',
            appearance: 'none',
            boxShadow: 'none',
          })}
        >
          Hide Nav
        </button>
      ) : null}
    </aside>
  );
}
