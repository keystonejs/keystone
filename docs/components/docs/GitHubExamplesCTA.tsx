/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Alert } from '../primitives/Alert';
import { Button } from '../primitives/Button';
import { ArrowR } from '../icons/ArrowR';

export function GitHubExamplesCTA() {
  return (
    <Alert css={{ margin: '2rem 0' }}>
      <span
        css={{
          display: 'inline-block',
          margin: '0 1rem 0.5rem 0',
        }}
      >
        See the full set of examples in our
      </span>
      <Button
        as="a"
        href="https://github.com/keystonejs/keystone/tree/master/examples"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub Repo <ArrowR />
      </Button>
    </Alert>
  );
}
