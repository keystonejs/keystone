/** @jsxImportSource @emotion/react */

'use client'

import { type Tag } from '@markdoc/markdoc'

import { type GroupedExamples } from './page'
import { GitHubExamplesCTA } from '../../../../components/docs/GitHubExamplesCTA'
import { Type } from '../../../../components/primitives/Type'
import { FeaturedCard, SplitCardContainer } from '../../../../components/docs/FeaturedCard'
import { useMediaQuery } from '../../../../lib/media'

export default function Docs ({
  standaloneExamples,
  endToEndExamples,
  deploymentExamples,
}: GroupedExamples) {
  return (
    <>
      <Type as="h1" look="heading64">
        Examples
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        A growing collection of projects you can run locally to learn more about Keystone’s
        capabilities. Each example includes documentation explaining the how and why. Use them as a
        reference for best practice, and a jumping off point when adding features to your own
        Keystone project.
      </Type>

      <GitHubExamplesCTA />

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0" id="standalone-examples">
        Standalone Examples
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Standalone examples demonstrate how a particular feature works or how to solve a problem
        with Keystone.
      </Type>

      <SplitCardContainer>
        {standaloneExamples.map((example) => (
          <FeaturedCard
            key={example.slug}
            label={example.entry.title}
            href={example.entry.url}
            description={example.entry.description as Tag}
          />
        ))}
      </SplitCardContainer>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0" id="end-to-end-examples">
        End-to-End Examples
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        End to end examples demonstrate how a feature works or how to solve a problem with an
        independent frontend application and a Keystone server.
      </Type>

      <SplitCardContainer>
        {endToEndExamples.map((example) => (
          <FeaturedCard
            key={example.slug}
            label={example.entry.title}
            href={example.entry.url}
            description={example.entry.description as Tag}
            gradient="grad2"
          />
        ))}
      </SplitCardContainer>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0" id="deployment-examples">
        Deployment Examples
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Examples with all the code and documentation you need to get a Keystone project hosted on
        the web. You can find them in the{' '}
        <a href="https://github.com/keystonejs/">Keystone Github Organisation</a>.
      </Type>

      <SplitCardContainer>
        {deploymentExamples.map((example) => (
          <FeaturedCard
            key={example.slug}
            label={example.entry.title}
            href={example.entry.url}
            description={example.entry.description as Tag}
            gradient="grad4"
          />
        ))}
      </SplitCardContainer>
    </>
  )
}
