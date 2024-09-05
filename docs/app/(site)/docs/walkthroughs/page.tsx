import { DocsLayout } from '../../../../components/docs/DocsLayout'
import { getFeaturedDocsMap } from '../../../../keystatic/get-featured-docs-map'
import { reader } from '../../../../keystatic/reader'
import PageClient from './page-client'

export const metadata = {
  title: 'Walkthroughs',
  description:
    'Explore tutorials with step-by-step instruction on building solutions with Keystone.',
}

export default async function Docs () {
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
