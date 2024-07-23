/** @jsxImportSource @emotion/react */

import Link from 'next/link'
import { type AnchorHTMLAttributes, type ReactNode } from 'react'

import { Type } from './Type'
import { Badge } from './Badge'

export type WellGradient = 'grad1' | 'grad2' | 'grad3' | 'grad4'

type WellProps = {
  grad?: WellGradient
  heading?: ReactNode
  badge?: string
  href: string
  children: ReactNode
} & AnchorHTMLAttributes<HTMLAnchorElement>

export function Well ({ grad = 'grad1', heading, badge, href, children, ...props }: WellProps) {
  return (
    <Link
      href={href}
      css={{
        position: 'relative',
        border: '1px solid var(--border)',
        borderRadius: '0.5rem 1rem 1rem 0.5rem',
        boxShadow: '0 0 5px var(--shadow)',
        padding: '1.875rem 2.5rem',
        color: 'var(--text)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease, padding 0.2s ease',
        textDecoration: 'none !important',
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
      rel={props.target === '_blank' ? 'noopener noreferrer' : undefined}
      {...props}
    >
      <Type
        as="h2"
        look="heading20bold"
        css={{
          margin: '0 0 1rem 0 !important',
          paddingRight: badge ? '6rem' : '2rem',
          fontSize: '1.25rem !important',
        }}
      >
        {heading} →
      </Type>
      {badge && (
        <Badge
          look="info"
          css={{
            position: 'absolute',
            top: '2rem',
            right: '1.2rem',
            transform: 'rotate(15deg)',
          }}
        >
          {badge}
        </Badge>
      )}
      <Type
        as={
          // if we have just a string for children or an array with a string in it,
          // it comes from a code file so we should wrap it in a <p>
          // if we have something else, it would have come from mdx
          // so it'll already be wrapped in a <p>
          // so we want to avoid it being wrapped in a <p> again
          // since React will complain
          typeof children === 'string' ||
          (Array.isArray(children) && children.some(child => typeof child === 'string'))
            ? 'p'
            : 'div'
        }
        look="body16"
      >
        {children}
      </Type>
    </Link>
  )
}
