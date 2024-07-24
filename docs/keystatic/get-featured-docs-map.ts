import { type Tag, transform } from '@markdoc/markdoc'
import { reader } from './keystatic-reader'
import { baseMarkdocConfig } from '../markdoc/config'

export type FeaturedDocsMap = Awaited<ReturnType<typeof getFeaturedDocsMap>>

export async function getFeaturedDocsMap () {
  const featured = await reader.singletons.featuredDocs.read({ resolveLinkedFiles: true })

  if (!featured) throw new Error('No featured list found')

  // We need the docs and examples data as well
  const [docs, examples] = await Promise.all([
    reader.collections.docs.all(),
    reader.collections.examples.all(),
  ])

  //  Individual doc and example accessors
  const docsBySlug = new Map(docs.map((doc) => [doc.slug, doc]))
  const examplesBySlug = new Map(examples.map((example) => [example.slug, example]))

  // Each `item` will need to be processed differently based on the `link` discriminant
  async function processItem ({ label, link, wide, gradient }) {
    const { discriminant, value } = link
    let description: Tag | null = null
    let href: string = '#'

    switch (discriminant) {
      case 'url': {
        description = transform(value.description.node, baseMarkdocConfig) as Tag
        href = value.url
        break
      }
      case 'docs': {
        const docPage = value.docPage ? docsBySlug.get(value.docPage) : null
        if (!docPage) throw new Error(`No doc page found for slug: ${value.docPage}`)
        description = transform(value.description.node, baseMarkdocConfig) as Tag
        href = docPage.slug ? `/docs/${docPage.slug}` : '#'
        break
      }
      case 'example': {
        const example = value.example ? examplesBySlug.get(value.example) : null
        const hasDescriptionOverride = !!value.descriptionOverride.discriminant
        let descNode
        if (hasDescriptionOverride) {
          descNode = value.descriptionOverride.value.node
        } else {
          if (!example) throw new Error(`No example found for slug: ${value.example}`)
          const awaited = await example.entry.description()
          descNode = awaited.node
        }
        description = transform(descNode, baseMarkdocConfig) as Tag
        href = example?.entry.url || '#'
        break
      }
    }

    return { label, description, href, wide, gradient }
  }

  // Processing all groups...
  const processedGroups = await Promise.all(
    featured.navGroups.map(async ({ groupName, groupDescription, gradient, items }) => {
      const transformedGroupDescription = transform(groupDescription.node, baseMarkdocConfig) as Tag
      const processedItems = await Promise.all(items.map(processItem))

      return {
        groupName,
        groupDescription: transformedGroupDescription,
        gradient,
        items: processedItems,
      }
    })
  )
  return processedGroups
}
