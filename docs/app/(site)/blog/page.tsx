import { reader } from '../../../keystatic/reader'
import { blogDateFormatter } from '../../../lib/date'
import ClientPage from './page-client'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Keystone Blog',
  description: 'Blog posts from the team maintaining Keystone.',
  openGraph: {
    images: '/assets/blog/the-keystone-blog-cover.png',
  },
}

export default async function Docs() {
  const keystaticPosts = await reader.collections.posts.all()

  const transformedPosts = keystaticPosts.map(post => ({
    slug: post.slug,
    frontmatter: { ...post.entry, content: null },
  }))

  // Reverse chronologically sorted
  const sortedPosts = transformedPosts
    .map(p => {
      const publishedDate = p.frontmatter.publishDate
      const formattedDateStr = blogDateFormatter.format(Temporal.PlainDate.from(publishedDate))
      return {
        ...p,
        frontmatter: { ...p.frontmatter },
        formattedDateStr: formattedDateStr,
      }
    })
    .sort((a, b) => {
      if (a.frontmatter.publishDate === b.frontmatter.publishDate) {
        return a.frontmatter.title.localeCompare(b.frontmatter.title)
      }
      return b.frontmatter.publishDate.localeCompare(a.frontmatter.publishDate)
    })

  return <ClientPage posts={sortedPosts} />
}
