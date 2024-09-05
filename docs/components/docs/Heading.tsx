/** @jsxImportSource @emotion/react */

'use client'

import slugify from '@sindresorhus/slugify'
import { type ReactNode } from 'react'

import { HeadingIdLink } from './CopyToClipboard'

/*
 * !THIS IS OLD. PLEASE USE THE Type COMPONENT INSTEAD!
 */

function getAnchor (text: string | string[]) {
  if (typeof text === 'string') {
    return slugify(text)
  } else if (Array.isArray(text)) {
    return slugify(text.join('-').replace('[object Object]', ''))
  } else {
    return ''
  }
}

const headingStyles = {
  1: {
    fontSize: 'var(--font-xxlarge)',
    fontWeight: 700,
    letterSpacing: '-0.03rem',
    marginTop: 0,
  },
  2: {
    fontSize: 'var(--font-xlarge)',
    fontWeight: 500,
    letterSpacing: '-0.03rem',
    marginTop: 0,
  },
  3: {
    fontSize: 'var(--font-large)',
    fontWeight: 500,
    letterSpacing: 'none',
    marginTop: 0,
  },
  4: {},
  5: {
    fontSize: 'var(--font-small)',
  },
  6: {
    fontSize: 'var(--font-xsmall)',
  },
}

type BaseHeadingProps = {
  className?: string
  children: ReactNode
} & ({ id: string } | { id?: undefined, children: string })

type HeadingProps = BaseHeadingProps & {
  level: 1 | 2 | 3 | 4 | 5 | 6
}

export function Heading ({ level, id, children, ...props }: HeadingProps) {
  const hasHeadingIdLink = level > 1 && level < 5
  const computedId = id === undefined ? getAnchor(children) : id
  const Tag = `h${level}` as const
  return (
    <Tag
      css={{
        color: 'var(--text-heading)',
        fontWeight: 600,
        lineHeight: 1,
        marginBottom: '0.66em',
        marginTop: '1.66em',
        ...headingStyles[level],
      }}
      id={computedId}
      {...props}
    >
      <span
        tabIndex={1}
        css={{
          display: 'block',
          position: 'relative',
          '&:hover a, &:focus-within a': {
            opacity: 1,
          },
        }}
      >
        {hasHeadingIdLink && <HeadingIdLink value={computedId} />}
        {children}
      </span>
    </Tag>
  )
}

export function H1 (props: BaseHeadingProps) {
  return <Heading level={1} {...props} />
}

export function H2 (props: BaseHeadingProps) {
  return <Heading level={2} {...props} />
}

export function H3 (props: BaseHeadingProps) {
  return <Heading level={3} {...props} />
}

export function H4 (props: BaseHeadingProps) {
  return <Heading level={4} {...props} />
}

export function H5 (props: BaseHeadingProps) {
  return <Heading level={5} {...props} />
}

export function H6 (props: BaseHeadingProps) {
  return <Heading level={6} {...props} />
}
