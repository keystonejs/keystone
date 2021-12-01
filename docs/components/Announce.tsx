/** @jsxRuntime classic */
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
        // standard styling (blue)
        // background: 'var(--brand-bg)',
        // special styling (orange gradient)
        backgroundColor: 'var(--grad4-2)',
        backgroundImage: `linear-gradient(116.01deg, var(--grad2-2), var(--grad2-1))`,
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
