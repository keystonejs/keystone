/** @jsx jsx */
import { jsx } from '@emotion/react';
import { HTMLAttributes, ReactNode } from 'react';

import { Wrapper } from './primitives/Wrapper';

type AnnounceProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLElement>;

export function Announce({ children, ...props }: AnnounceProps) {
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
