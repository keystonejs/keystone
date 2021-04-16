/** @jsx jsx  */
import { jsx } from '@keystone-ui/core';
import { useState } from 'react';

import { useMediaQuery } from '../lib/media';
import { Navigation } from './Navigation';

export function Sidebar() {
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(true);
  const mq = useMediaQuery();

  return (
    <aside
      css={mq({
        fontSize: '0.875rem',
        borderBottom: ['1px solid var(--gray-200)', null, 'none'],
      })}
    >
      {mobileNavCollapsed ? (
        <button
          onClick={() => setMobileNavCollapsed(false)}
          css={mq({
            display: ['block', null, 'none'],
            fontWeight: 600,
            fontSize: '1rem',
            padding: '1rem',
            width: '100%',
            textAlign: 'left',
          })}
        >
          Show Nav
        </button>
      ) : null}
      <div
        css={mq({
          display: [mobileNavCollapsed ? 'none' : 'block', null, 'block'],
          marginTop: '1.5rem',
          padding: ['0 0 1rem 1rem', null, 0],
          borderBottom: ['1px solid var(--gray-200)', null, 'none'],
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
            fontSize: '1rem',
            padding: '1rem',
            width: '100%',
            textAlign: 'left',
          })}
        >
          Hide Nav
        </button>
      ) : null}
    </aside>
  );
}
