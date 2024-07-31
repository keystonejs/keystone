import { DocsLayout } from '../../../components/docs/DocsLayout'
import PageClient from './page-client'

export const metadata = {
  title: 'Latest News',
  description: 'What’s new with Keystone. A snapshot of announcements and recent releases.',
}

export default function WhatsNew () {
  return (
    <DocsLayout noRightNav noProse isIndexPage>
      <PageClient />
    </DocsLayout>
  )
}
