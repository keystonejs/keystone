/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Alert } from '../primitives/Alert';

export function ComingSoon() {
  return (
    <Alert>
      <p
        css={{
          margin: '0 !important',
        }}
      >
        We've planned this page but not had a chance to write it yet.
      </p>
    </Alert>
  );
}
