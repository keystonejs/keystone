import { DocsLayout } from '../../../../components/docs/DocsLayout'
import PageClient from './page-client'

export const metadata = {
  title: 'Roadmap',
  description: "Discover where KeystoneJS is headed, and why we're going there.",
}

export default function Roadmap () {
  return (
    <DocsLayout noRightNav noProse isIndexPage>
      <PageClient />
    </DocsLayout>
  )
}
