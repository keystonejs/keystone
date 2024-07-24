import { DocsLayout } from '../../../../components/docs/DocsLayout'
import PageClient from './page-client'

export const metadata = {
  title: 'Walkthroughs',
  description:
    'Explore tutorials with step-by-step instruction on building solutions with Keystone.',
}

export default function Docs () {
  return (
    <DocsLayout noRightNav noProse isIndexPage editPath="docs/walkthroughs/index.tsx">
      <PageClient />
    </DocsLayout>
  )
}
