/** @jsxImportSource @emotion/react */

'use client'

import { Well } from '../../primitives/Well'
import { useMediaQuery } from '../../../lib/media'
import { Markdoc } from '../../Markdoc'
import { type FeaturedExamples } from '.'
import { Type } from '../../primitives/Type'

export default function ExamplesList ({ featuredExamples }: { featuredExamples: FeaturedExamples }) {
  if (!featuredExamples) return null
  const mq = useMediaQuery()
  return (
    <>
      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        {featuredExamples.label}
      </Type>

      {!!featuredExamples.description && (
        <Type as="div" look="body18" margin="0 0 1.5rem 0">
          {featuredExamples.description.children.map((child, i) => (
            <Markdoc key={i} content={child} />
          ))}
        </Type>
      )}

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        {featuredExamples.items.map(
          (item, i) =>
            !!item && (
              <Well
                key={i}
                grad="grad3"
                heading={item.title}
                href={item.url}
                target="_blank"
                rel="noreferrer"
              >
                {item.description.children.map((child, i) => (
                  <Markdoc key={i} content={child} />
                ))}
              </Well>
            )
        )}
      </div>
    </>
  )
}
