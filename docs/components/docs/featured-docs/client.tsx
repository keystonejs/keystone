'use client'

import { Well } from '../../primitives/Well'
import { Type } from '../../primitives/Type'

import { Markdoc } from '../../Markdoc'
import { FeaturedCard, FullWidthCardContainer, SplitCardContainer } from '../FeaturedCard'
import { type FeaturedDocsMap } from '../../../keystatic/get-featured-docs-map'

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
        <FullWidthCardContainer>
          <Well heading={featuredItem.label} href={featuredItem.href}>
            {featuredItem.description.children.map((child, i) => (
              <Markdoc key={i} content={child} />
            ))}
          </Well>
        </FullWidthCardContainer>
      )}
      {/* Remaining items of the first group */}
      <SplitCardContainer>
        {restItems.map((item, i) => (
          <FeaturedCard key={`${item.label}-${i}`} gradient={firstGroup.gradient} item={item} />
        ))}
      </SplitCardContainer>

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

            <SplitCardContainer>
              {group.items.map((item, j) => (
                <FeaturedCard key={j} gradient={group.gradient} item={item} />
              ))}
            </SplitCardContainer>
          </div>
        ))}
    </>
  )
}