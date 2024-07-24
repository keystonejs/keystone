/** @jsxImportSource @emotion/react */

'use client'

import { Well } from '../../primitives/Well'
import { useMediaQuery } from '../../../lib/media'
import { Type } from '../../primitives/Type'
import { type FeaturedDocsMap } from '.'
import { Markdoc } from '../../Markdoc'
import { useId } from 'react'

export function FeaturedDocsClient ({ featuredDocsMap }: { featuredDocsMap: FeaturedDocsMap }) {
  if (!featuredDocsMap) return null

  // Separating the first group/item for featured UI treatment
  const [firstGroup, ...restGroups] = featuredDocsMap
  const [featuredItem, ...restItems] = firstGroup.items

  return (
    <>
      {/* First Group */}
      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        {firstGroup.groupName}
      </Type>
      <Type as="div" look="body18" margin="0 0 1.5rem 0">
        {firstGroup.groupDescription.children.map((child, i) => (
          <Markdoc key={i} content={child} />
        ))}
      </Type>

      {/* Featured Item */}
      {!!featuredItem.description && (
        <FullWidthContainer>
          <Well heading={featuredItem.label} href={featuredItem.href}>
            {featuredItem.description.children.map((child, i) => (
              <Markdoc key={i} content={child} />
            ))}
          </Well>
        </FullWidthContainer>
      )}
      {/* Remaining items of the first group */}
      <SplitContainer>
        {restItems.map((item, i) => (
          <DocWell key={`${item.label}-${i}`} group={firstGroup} item={item} />
        ))}
      </SplitContainer>

      {/* Remaining groups */}
      {!!restGroups &&
        restGroups.map((group, i) => (
          <div key={i}>
            <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
              {group.groupName}
            </Type>
            <Type as="div" look="body18" margin="0 0 1.5rem 0">
              {group.groupDescription.children.map((child, j) => (
                <Markdoc key={j} content={child} />
              ))}
            </Type>

            <SplitContainer>
              {group.items.map((item, j) => (
                <DocWell key={j} group={group} item={item} />
              ))}
            </SplitContainer>
          </div>
        ))}
    </>
  )
}

function FullWidthContainer ({ children }: { children: React.ReactNode }) {
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

function SplitContainer ({ children }: { children: React.ReactNode }) {
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

function DocWell ({ group, item }) {
  const id = useId()
  return (
    <Well heading={item.label} href={item.href} grad={group.gradient}>
      {item.description?.children.map((child, i) => (
        <Markdoc key={`${id}-${i}`} content={child} />
      ))}
    </Well>
  )
}
