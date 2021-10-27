/** @jsxRuntime classic */
/** @jsx jsx */
import type { HTMLAttributes } from 'react';
import { jsx } from '@emotion/react';

import { Type } from '../primitives/Type';
import { Quote } from '../icons/Quote';

type TweetBoxProps = {
  user: string;
  img: string;
  grad: 'grad1' | 'grad2' | 'grad3' | 'grad4' | 'grad5';
} & HTMLAttributes<HTMLElement>;

export function TweetBox({ user, img, grad, children, ...props }: TweetBoxProps) {
  return (
    <div
      css={{
        background: 'var(--app-bg)',
        padding: '2rem',
        border: '1px solid var(--border-muted)',
        borderRadius: '1rem',
        boxShadow: '0px 20px 38px -7px var(--shadow)',
        margin: '0 auto',
      }}
      {...props}
    >
      <Quote
        grad={grad}
        css={{
          height: '2rem',
          margin: '0 0 1rem 0',
        }}
      />
      <Type as="p" look="body18" color="var(--muted)">
        {children}
      </Type>
      <a
        href={`https://twitter.com/${user}`}
        target="_blank"
        rel="noopener noreferrer"
        css={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '1.5rem',
          fontWeight: 700,
        }}
      >
        <img
          src={img}
          alt={`@${user} user image`}
          css={{
            height: '2rem',
            borderRadius: '100%',
            margin: '0 1rem 0 0',
          }}
        />
        @{user}
      </a>
    </div>
  );
}
