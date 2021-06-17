/** @jsx jsx */
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { Button } from '../primitives/Button';
import { Stack } from '../primitives/Stack';

export function ComingSoon() {
  return (
    <div
      css={{
        display: 'grid',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        padding: 'var(--space-medium)',
        borderWidth: '1px',
      }}
    >
      <Stack
        css={{
          width: '100%',
          justifyContent: 'space-between',
        }}
        orientation="horizontal"
      >
        <p
          css={{
            margin: '0 !important',
          }}
        >
          Coming Soon... Visit our roadmap for more information
        </p>
        <Link href="/docs/roadmap" passHref>
          <Button as="a">Roadmap</Button>
        </Link>
      </Stack>
    </div>
  );
}
