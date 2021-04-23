/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { Fragment } from 'react';

import { Page } from '../components/Page';
import { COLORS } from '../lib/COLORS';

export default function DS() {
  return (
    <Page>
      <h1>DS</h1>
      <h2>Colors</h2>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '0.5rem',
        }}
      >
        {Object.entries(COLORS).map(([name, color]) => (
          <Fragment>
            <span
              css={{
                display: 'inline-block',
                padding: '1rem 0',
                textAlign: 'right',
              }}
            >
              {name}
            </span>
            <div css={{ background: color }} />
          </Fragment>
        ))}
      </div>
    </Page>
  );
}
