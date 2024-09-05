import ClientComponent from './client'

import { type Tag, transform } from '@markdoc/markdoc'
import { reader } from '../../../keystatic/reader'
import { baseMarkdocConfig } from '../../../markdoc/config'


export type FeaturedExamples = Awaited<ReturnType<typeof getFeaturedExamples>>

async function getFeaturedExamples () {
  const featuredExamples = await reader.singletons.featuredExamples.read({
    resolveLinkedFiles: true,
  })

  if (!featuredExamples) return null

  // Get the rich text fields Markdoc-ready
  const transformedFeaturedExamples = {
    ...featuredExamples,
    description: transform(featuredExamples.description.node, baseMarkdocConfig) as Tag,
    items: await Promise.all(
      featuredExamples.items.map(async (itemSlug) => {
        const item = await reader.collections.examples.read(itemSlug, {
          resolveLinkedFiles: true,
        })
        if (!item) return null
        return {
          ...item,
          description: transform(item.description.node, baseMarkdocConfig) as Tag,
        }
      })
    ),
  }

  return transformedFeaturedExamples
}

export async function FeaturedExamples () {
  const featuredExamples = await getFeaturedExamples()
  return <ClientComponent featuredExamples={JSON.parse(JSON.stringify(featuredExamples))} />
}
