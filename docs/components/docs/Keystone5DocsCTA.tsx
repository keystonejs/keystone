/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Alert } from '../primitives/Alert';

export function Keystone5DocsCTA() {
  return (
    <Alert css={{ margin: '2rem 0' }}>
      <span
        css={{
          display: 'inline-block',
          margin: '0 1rem 0rem 0',
        }}
      >
        Using <strong>Keystone 5</strong>? Find the docs at{' '}
        <a href="https://v5.keystonejs.com/documentation" target="_blank" rel="noopener noreferrer">
          v5.keystonejs.com
        </a>
      </span>
    </Alert>
  );
}
