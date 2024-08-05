import { DocsLayout } from '../../../../../components/docs/DocsLayout'
import PageClient from './page-client'

export const metadata = {
  title: 'Document Fields Demo',
  description:
    'Try Keystone’s powerful new Document field. Experiment with its config settings in real time to shape custom editing experiences.',
}

export default function DocumentFieldDemo () {
  return (
    <DocsLayout
      noProse
      headings={[
        {
          label: 'Document Fields Demo',
          id: 'title',
          depth: 1,
        },
        {
          label: 'Configure the demo',
          id: 'configure-the-demo',
          depth: 2,
        },
        {
          label: 'Related resources',
          depth: 2,
          id: 'related-resources',
        },
      ]}
      isIndexPage
    >
      <PageClient />
    </DocsLayout>
  )
}
