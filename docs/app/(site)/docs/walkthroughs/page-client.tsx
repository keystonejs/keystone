/** @jsxImportSource @emotion/react */

'use client'

import { Type } from '../../../../components/primitives/Type'
import { type FeaturedDocsMap } from '../../../../keystatic/get-featured-docs-map'
import {
  FeaturedCard,
  FullWidthCardContainer,
  SplitCardContainer,
} from '../../../../components/docs/FeaturedCard'

export default function Docs ({
  quickstart,
  walkthroughs,
}: {
  quickstart: NonNullable<FeaturedDocsMap>[number]['items'][number]
  walkthroughs: NonNullable<FeaturedDocsMap>[number]['items']
}) {
  return (
    <>
      <Type as="h1" look="heading64">
        Walkthroughs
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Step-by-step tutorials for building with Keystone.
      </Type>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        Getting started
      </Type>

      <Type as="p" look="body18" margin=".25rem 0 1.5rem 0">
        If you’re new to Keystone begin here. These walkthroughs introduce the system, key concepts,
        and show you how to get up and running with schema-driven development the Keystone way.
      </Type>

      <FullWidthCardContainer>
        <FeaturedCard
          label={quickstart.label}
          href={quickstart.href}
          description={quickstart.description}
        />
      </FullWidthCardContainer>

      <Type as="h3" look="heading24" margin="2rem 0 1rem 0" id="learn-keystone">
        Learn Keystone
      </Type>

      <Type as="p" look="body18" margin=".25rem 0 1.5rem 0">
        Learn how to build a functioning blog backend with relationships, auth, and session data
        from an empty folder, and gain insights into Keystone’s core concepts along the way.
      </Type>

      <SplitCardContainer>
        {walkthroughs.map((item) => (
          <FeaturedCard
          label={item.label}
          href={item.href}
          description={item.description}
        />
        ))}
      </SplitCardContainer>
    </>
  )
}
