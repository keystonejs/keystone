import PageClient from './page-client.tsx'
import { FeaturedExamples } from '../../../components/docs/featured-examples/index.tsx'
import { FeaturedDocs } from '../../../components/docs/featured-docs/index.tsx'

import { DocsLayout } from '../../../components/docs/DocsLayout.tsx'

export const metadata = {
  title: 'Keystone Docs Home',
  description: 'Developer docs for KeystoneJS: The superpowered headless CMS for developers.',
}

export default function Docs() {
  return (
    <DocsLayout noRightNav noProse isIndexPage>
      <PageClient featuredExamples={<FeaturedExamples />} featuredDocs={<FeaturedDocs />} />
    </DocsLayout>
  )
}
