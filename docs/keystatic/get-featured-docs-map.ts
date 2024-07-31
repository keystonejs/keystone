import { type Tag, transform } from '@markdoc/markdoc'
import { reader } from './reader'
import { baseMarkdocConfig } from '../markdoc/config'

export type FeaturedDocsMap = Awaited<ReturnType<typeof getFeaturedDocsMap>>

export async function getFeaturedDocsMap () {
  const featuredDocs = await reader.singletons.featuredDocs.read({ resolveLinkedFiles: true })
  if (!featuredDocs) return null

  // We need the docs data as well...
  const docs = await reader.collections.docs.all()
  //  Individual doc accessor
  const docsBySlug = new Map(docs.map((doc) => [doc.slug, doc]))

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
    }

    return { label, description, href, wide, gradient }
  }

  // Processing all groups...
  const processedGroups = await Promise.all(
    featuredDocs.groups.map(async ({ groupName, groupDescription, gradient, items }) => {
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