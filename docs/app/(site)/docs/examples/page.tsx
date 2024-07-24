import { DocsLayout } from '../../../../components/docs/DocsLayout'
import PageClient from './page-client'

export const metadata = {
  title: 'Examples',
  description:
    'A growing collection of projects you can run locally to learn more about Keystone’s many features. Use them as a reference for best practice, and springboard when adding features to your own project.',
}

export default function Docs () {
  return (
    <DocsLayout noRightNav noProse editPath={'docs/examples.tsx'}>
      <PageClient />
    </DocsLayout>
  )
}
