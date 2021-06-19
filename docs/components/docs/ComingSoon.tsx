/** @jsx jsx */
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { Button } from '../primitives/Button';
import { Alert } from '../primitives/Alert';
import { Stack } from '../primitives/Stack';

export function ComingSoon() {
  return (
    <Alert look="tip">
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
    </Alert>
  );
}
