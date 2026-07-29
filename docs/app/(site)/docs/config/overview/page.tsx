import { DocsLayout } from '../../../../../components/docs/DocsLayout.tsx'
import PageClient from './page-client.tsx'

export const metadata = {
  title: 'APIs',
  description: 'Index for Keystone’s API reference docs.',
}

export default function Docs() {
  return (
    <DocsLayout noRightNav noProse isIndexPage>
      <PageClient />
    </DocsLayout>
  )
}
