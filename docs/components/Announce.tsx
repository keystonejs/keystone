/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Wrapper } from './primitives/Wrapper';

export function Announce({ children, ...props }) {
  return (
    <div
      css={{
        '--focus': '#fff',
        background: 'var(--brand-bg)',
        color: 'var(--brand-text)',
        padding: '1rem',
        textAlign: 'center',
        '& a': {
          color: 'var(--brand-text)',
          textDecoration: 'underline',
        },
      }}
      {...props}
    >
      <Wrapper>{children}</Wrapper>
    </div>
  );
}
