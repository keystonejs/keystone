import { notFound } from 'next/navigation'
import { type Tag, transform } from '@markdoc/markdoc'

import { reader } from '../../../../keystatic/reader'
import { baseMarkdocConfig } from '../../../../markdoc/config'
import { extractHeadings } from '../../../../markdoc/headings'
import PageClient from './page-client'
import { type EntryWithResolvedLinkedFiles } from '@keystatic/core/reader'
import type keystaticConfig from '../../../../keystatic.config'
import { DocsLayout } from '../../../../components/docs/DocsLayout'

export type Document = NonNullable<
  Pick<
    EntryWithResolvedLinkedFiles<(typeof keystaticConfig)['collections']['docs']>,
    'title' | 'description'
  > & {
    content: Tag
  }
>

export default async function DocPage ({ params }) {
  const doc = await reader.collections.docs.read(params!.rest.join('/'), {
    resolveLinkedFiles: true,
  })
  if (!doc) return notFound()

  const transformedDoc: Document = {
    ...doc,
    content: transform(doc.content.node, baseMarkdocConfig) as Tag,
  }

  const headings = [
    { id: 'title', depth: 1, label: transformedDoc.title },
    ...extractHeadings(transformedDoc.content),
  ]

  return (
    <DocsLayout headings={headings} editPath={`docs/${(params?.rest as string[]).join('/')}.md`}>
      <PageClient document={JSON.parse(JSON.stringify(transformedDoc))} />
    </DocsLayout>
  )
}

// Dynamic SEO page metadata
export async function generateMetadata ({ params }) {
  const doc = await reader.collections.docs.read(params!.rest.join('/'))
  return {
    title: doc?.title ? `${doc.title} - Keystone 6 Documentation` : 'Keystone 6 Documentation',
    description: doc?.description,
  }
}

// Static HTML page generation for each document page
export async function generateStaticParams () {
  const pages = await reader.collections.docs.list()
  return pages.map((page) => ({ rest: page.split('/') }))
}
