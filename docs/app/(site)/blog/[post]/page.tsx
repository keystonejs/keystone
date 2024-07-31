import { type Tag, transform } from '@markdoc/markdoc'
import { notFound } from 'next/navigation'

import { getOgAbsoluteUrl } from '../../../../lib/og-util'
import { reader } from '../../../../keystatic/reader'
import { baseMarkdocConfig } from '../../../../markdoc/config'
import { type EntryWithResolvedLinkedFiles } from '@keystatic/core/reader'
import type keystaticConfig from '../../../../keystatic.config'
import PageClient from './page-client'
import { type Metadata } from 'next'

export type BlogPost = NonNullable<
  Omit<
    EntryWithResolvedLinkedFiles<(typeof keystaticConfig)['collections']['posts']>,
    'content'
  > & {
    content: Tag
  }
>

export default async function Page ({ params }) {
  const post = await reader.collections.posts.read(params!.post, {
    resolveLinkedFiles: true,
  })

  if (!post) return notFound()

  return (
    <PageClient
      post={JSON.parse(
        JSON.stringify({
          ...post,
          // Prepare content for Markdoc renderer
          content: transform(post.content.node, baseMarkdocConfig),
        })
      )}
    />
  )
}

// Dynamic SEO page metadata
export async function generateMetadata ({ params }): Promise<Metadata> {
  const post = await reader.collections.posts.read(params!.post)

  const title = post?.title ? `${post.title} - Keystone 6 Blog` : 'Keystone 6 Blog'

  let ogImageUrl = post?.metaImageUrl
  if (!ogImageUrl) {
    ogImageUrl = getOgAbsoluteUrl({
      title,
      type: 'Blog',
    })
  }

  return {
    title,
    description: post?.description,
    openGraph: {
      images: ogImageUrl,
    },
  }
}

// Static HTML page generation for each document page
export async function generateStaticParams () {
  const posts = await reader.collections.posts.list()
  return posts.map((post) => ({ post }))
}
