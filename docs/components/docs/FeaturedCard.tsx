/** @jsxImportSource @emotion/react */

'use client'

import { useId } from 'react'
import { Well } from '../primitives/Well'
import { Markdoc } from '../Markdoc'
import { useMediaQuery } from '../../lib/media'
import { type Gradient } from '../../keystatic/gradient-selector'
import { type FeaturedDocsMap } from '../../keystatic/get-featured-docs-map'

export function FeaturedCard ({
  item,
  gradient = 'grad1',
}: {
  item: NonNullable<FeaturedDocsMap>[number]['items'][number]
  gradient?: Gradient
}) {
  const id = useId()
  return (
    <Well heading={item.label} href={item.href} grad={gradient}>
      {item.description?.children.map((child, i) => (
        <Markdoc key={`${id}-${i}`} content={child} />
      ))}
    </Well>
  )
}

export function FullWidthCardContainer ({ children }: { children: React.ReactNode }) {
  const mq = useMediaQuery()
  return (
    <div
      css={mq({
        display: 'grid',
        gridTemplateColumns: ['1fr'],
        gap: 'var(--space-xlarge)',
        margin: '0 0 var(--space-xlarge) 0',
      })}
    >
      {children}
    </div>
  )
}

export function SplitCardContainer ({ children }: { children: React.ReactNode }) {
  const mq = useMediaQuery()
  return (
    <div
      css={mq({
        display: 'grid',
        gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
        gap: 'var(--space-xlarge)',
      })}
    >
      {children}
    </div>
  )
}
