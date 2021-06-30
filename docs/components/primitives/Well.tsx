/** @jsx jsx */
import { jsx } from '@emotion/react';
import Link from 'next/link';
import { AnchorHTMLAttributes, ReactNode } from 'react';

import { Type } from './Type';

export type WellGradient = 'grad1' | 'grad2' | 'grad3' | 'grad4';

type WellProps = {
  grad?: WellGradient;
  heading?: ReactNode;
  href: string;
  children: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export function Well({ grad = 'grad1', heading, href, children, ...props }: WellProps) {
  return (
    <Link href={href} passHref>
      <a
        css={{
          position: 'relative',
          border: '1px solid var(--border)',
          borderRadius: '0.5rem 1rem 1rem 0.5rem',
          boxShadow: '0 0 5px var(--shadow)',
          padding: '1.875rem 2.5rem',
          color: 'var(--text)',
          overflow: 'hidden',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease, padding 0.2s ease',
          ':before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '0.5rem',
            backgroundImage: `linear-gradient(116.01deg, var(--${grad}-1), var(--${grad}-2))`,
          },
          '&:hover, &:focus': {
            boxShadow: '0 7px 21px var(--shadow)',
            transform: 'translateY(-4px)',
          },
        }}
        {...props}
      >
        <Type
          as="h2"
          look="heading20bold"
          css={{
            margin: '0 0 1rem 0',
            paddingRight: '2rem',
          }}
        >
          {heading} →
        </Type>
        <Type as="p" look="body16">
          {children}
        </Type>
      </a>
    </Link>
  );
}
