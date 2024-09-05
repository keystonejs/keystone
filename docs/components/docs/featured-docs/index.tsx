import { FeaturedDocsClient } from './client'

import { getFeaturedDocsMap } from '../../../keystatic/get-featured-docs-map'

export async function FeaturedDocs () {
  const featuredDocsMap = await getFeaturedDocsMap()
  return <FeaturedDocsClient featuredDocsMap={JSON.parse(JSON.stringify(featuredDocsMap))} />
}
