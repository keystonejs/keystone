import { notFound } from 'next/navigation'
import { type Tag, transform } from '@markdoc/markdoc'

import { reader } from '../../../../lib/keystatic-reader'
import { baseMarkdocConfig } from '../../../../markdoc/config'
import PageClient from './page-client'
import { type EntryWithResolvedLinkedFiles } from '@keystatic/core/reader'
import type keystaticConfig from '../../../../keystatic.config'

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

  return (
    <PageClient
      document={JSON.parse(
        JSON.stringify({
          ...doc,
          // Prepare content for Markdoc renderer
          content: transform(doc.content.node, baseMarkdocConfig),
        })
      )}
    />
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
