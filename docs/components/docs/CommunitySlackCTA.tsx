/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Alert } from '../primitives/Alert';
import { Button } from '../primitives/Button';
import { ArrowR } from '../icons/ArrowR';

export function CommunitySlackCTA() {
  return (
    <Alert css={{ margin: '2rem 0' }}>
      <span
        css={{
          display: 'inline-block',
          margin: '0 1rem 0.5rem 0',
        }}
      >
        Need answers to Keystone questions? Get help in our
      </span>
      <Button
        as="a"
        href="https://community.keystonejs.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Community Slack <ArrowR />
      </Button>
    </Alert>
  );
}
