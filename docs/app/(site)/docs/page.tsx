import PageClient from './page-client'
import { FeaturedExamples } from '../../../components/docs/featured-examples'
import { FeaturedDocs } from '../../../components/docs/featured-docs'

import { DocsLayout } from '../../../components/docs/DocsLayout'

export const metadata = {
  title: 'Keystone Docs Home',
  description: 'Developer docs for KeystoneJS: The superpowered headless CMS for developers.',
}

export default function Docs () {
  return (
    <DocsLayout noRightNav noProse isIndexPage>
      <PageClient
        featuredExamples={<FeaturedExamples />}
        featuredDocs={<FeaturedDocs />}
      />
    </DocsLayout>
  )
}
