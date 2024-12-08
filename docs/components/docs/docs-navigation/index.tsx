import { reader } from '../../../keystatic/reader'
import { DocsNavigationClient } from './client'

export type NavigationMap = Awaited<ReturnType<typeof getNavigationMap>>

export async function getNavigationMap () {
  const navigation = await reader.singletons.navigation.read()
  const pages = await reader.collections.docs.all()

  const pagesBySlug = Object.fromEntries(pages.map((page) => [page.slug, page]))

  const navigationMap = navigation?.navGroups.map(({ groupName, items }) => ({
    groupName,
    items: items.map(({ label, link, status }) => {
      const { discriminant, value } = link
      const page = discriminant === 'page' && value ? pagesBySlug[value] : null
      const url = discriminant === 'url' ? value : `/docs/${page?.slug}`

      return {
        label: label || page?.entry.title || '',
        href: url || '',
        status,
      }
    }),
  }))

  return navigationMap
}

export async function DocsNavigation () {
 const navigationMap = await getNavigationMap()
 return <DocsNavigationClient navigationMap={navigationMap} />
}