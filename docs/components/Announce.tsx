/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { HTMLAttributes } from 'react'

export function Announce(props: HTMLAttributes<HTMLElement>) {
  return (
    <div
      css={{
        background: 'var(--black)',
        color: 'var(--white)',
        padding: '0.7rem',
        textAlign: 'center',
      }}
      {...props}
    />
  );
}
