/** @jsx jsx */
import { jsx } from '@emotion/react';
import Link from 'next/link';
import { AnchorHTMLAttributes, ReactNode } from 'react';
import { Organization } from '../icons/Organization';

import { Type } from './Type';

export type FeatureWellGradient = 'grad1' | 'grad2' | 'grad3' | 'grad4';

type FeatureWellProps = {
  grad?: FeatureWellGradient;
  heading?: ReactNode;
  href: string;
  children: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export function FeatureWell({
  grad = 'grad1',
  heading,
  href,
  children,
  ...props
}: FeatureWellProps) {
  return (
    <Link href={href} passHref>
      <a
        css={{
          position: 'relative',
          borderRadius: '1rem',
          backgroundImage: `linear-gradient(116.01deg, var(--${grad}-2), var(--${grad}-1))`,
          boxShadow: '0 0 5px var(--shadow)',
          padding: '1.5rem',
          color: 'var(--app-bg)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease, padding 0.2s ease',
          textDecoration: 'none !important',
          '&:hover, &:focus': {
            boxShadow: '0 7px 21px var(--shadow)',
            transform: 'translateY(-4px)',
          },
          '& svg': {
            height: '2rem',
          },
        }}
        {...props}
      >
        <Organization />
        <Type
          as="h2"
          look="heading20bold"
          css={{
            margin: '.5rem 0 .5rem 0 !important',
            color: 'inherit',
          }}
        >
          {heading} →
        </Type>
        <Type
          as="p"
          look="body18"
          css={{
            color: 'inherit',
          }}
        >
          {children}
        </Type>
      </a>
    </Link>
  );
}
