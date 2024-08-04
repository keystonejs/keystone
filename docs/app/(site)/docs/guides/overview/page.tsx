import { DocsLayout } from '../../../../../components/docs/DocsLayout'
import PageClient from './page-client'

export const metadata = {
  title: 'Guides',
  description:
    'Practical explanations of Keystone’s fundamental building blocks. Learn how to think about, and get the most out of Keystone’s many features.',
}

export default function Docs () {
  return (
    <DocsLayout noRightNav noProse isIndexPage>
      <PageClient />
    </DocsLayout>
  )
}
