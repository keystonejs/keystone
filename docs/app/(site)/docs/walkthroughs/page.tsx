import { DocsLayout } from '../../../../components/docs/DocsLayout.tsx'
import { getFeaturedDocsMap } from '../../../../keystatic/get-featured-docs-map.ts'
import { reader } from '../../../../keystatic/reader.ts'
import PageClient from './page-client.tsx'

export const metadata = {
  title: 'Walkthroughs',
  description:
    'Explore tutorials with step-by-step instruction on building solutions with Keystone.',
}

export default async function Docs() {
  const docs = await getFeaturedDocsMap()
  if (!docs) throw new Error('No `featuredDocs` found')
  const featuredDocs = docs[0]
  const [quickstart, ...walkthroughs] = featuredDocs.items

  return (
    <DocsLayout noRightNav noProse isIndexPage>
      <PageClient
        quickstart={JSON.parse(JSON.stringify(quickstart))}
        walkthroughs={JSON.parse(JSON.stringify(walkthroughs))}
      />
    </DocsLayout>
  )
}
