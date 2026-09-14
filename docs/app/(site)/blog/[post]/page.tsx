import Markdoc, { type Tag } from '@markdoc/markdoc'
import { notFound } from 'next/navigation'

import { reader } from '../../../../keystatic/reader.ts'
import { baseMarkdocConfig } from '../../../../markdoc/config.ts'
import type { EntryWithResolvedLinkedFiles } from '@keystatic/core/reader'
import type keystaticConfig from '../../../../keystatic.config'
import PageClient from './page-client.tsx'
import type { Metadata } from 'next'
import { blogDateFormatter } from '../../../../lib/date.ts'

export type BlogPost = NonNullable<
  Omit<
    EntryWithResolvedLinkedFiles<(typeof keystaticConfig)['collections']['posts']>,
    'content'
  > & {
    content: Tag
  }
>

export default async function Page({ params }) {
  const _params = await params
  const post = await reader.collections.posts.read(_params!.post, {
    resolveLinkedFiles: true,
  })

  if (!post) return notFound()
  const publishedDate = post.publishDate
  const formattedDateStr = blogDateFormatter.format(Temporal.PlainDate.from(publishedDate))

  return (
    <PageClient
      post={JSON.parse(
        JSON.stringify({
          ...post,
          // Prepare content for Markdoc renderer
          content: Markdoc.transform(post.content.node, baseMarkdocConfig),
        })
      )}
      formattedDate={formattedDateStr}
    />
  )
}

// Dynamic SEO page metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const _params = await params
  const post = await reader.collections.posts.read(_params!.post)

  const title = post?.title ? `${post.title} - Keystone 6 Blog` : 'Keystone 6 Blog'
  const description = post?.description
  const image = `/blog/${_params!.post}/opengraph-image.png`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: 'Keystone Blog' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

// Static HTML page generation for each document page
export async function generateStaticParams() {
  const posts = await reader.collections.posts.list()
  return posts.map(post => ({ post }))
}
