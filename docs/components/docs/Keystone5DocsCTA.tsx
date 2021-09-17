/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Alert } from '../primitives/Alert';
import { Button } from '../primitives/Button';
import { ArrowR } from '../icons/ArrowR';

export function Keystone5DocsCTA() {
  return (
    <Alert css={{ margin: '2rem 0' }}>
      <span
        css={{
          display: 'inline-block',
          margin: '0 1rem 0.5rem 0',
        }}
      >
        Using <strong>Keystone 5</strong>? Please visit{' '}
        <a href="https://v5.keystonejs.com/documentation" target="_blank">
          v5.keystonejs.com
        </a>{' '}
        for the most up-to-date information.
      </span>
      <Button
        as="a"
        look="secondary"
        size="small"
        href="https://v5.keystonejs.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Keystone 5 <ArrowR />
      </Button>
    </Alert>
  );
}
