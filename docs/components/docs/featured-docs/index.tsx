import { FeaturedDocsClient } from './client.tsx'

import { getFeaturedDocsMap } from '../../../keystatic/get-featured-docs-map.ts'

export async function FeaturedDocs() {
  const featuredDocsMap = await getFeaturedDocsMap()
  return <FeaturedDocsClient featuredDocsMap={JSON.parse(JSON.stringify(featuredDocsMap))} />
}
