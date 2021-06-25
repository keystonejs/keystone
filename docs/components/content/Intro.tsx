/** @jsx jsx */
import { HTMLAttributes } from 'react';
import { jsx } from '@emotion/react';

import { Type } from '../primitives/Type';

export function IntroWrapper(props: HTMLAttributes<HTMLElement>) {
  return (
    <div
      css={{
        'p + p': {
          margin: '1rem 0 0 0',
        },
      }}
      {...props}
    />
  );
}

export function IntroHeading(props: HTMLAttributes<HTMLElement>) {
  return (
    <Type
      as="h1"
      look="heading92"
      fontSize={['2.85rem', '4rem', null, '5.75rem']}
      margin={['1rem 0 2rem 0', null, null, '1rem 0 2rem 0']}
      css={{
        maxWidth: '64rem',
      }}
      {...props}
    />
  );
}

export function IntroLead(props: HTMLAttributes<HTMLElement>) {
  return (
    <Type
      as="p"
      look="body20"
      color="var(--muted)"
      css={{
        maxWidth: '49rem',
      }}
      {...props}
    />
  );
}
