import { parse, format } from 'date-fns'

import { reader } from '../../../keystatic/reader'
import ClientPage from './page-client'
import { type Metadata } from 'next'

const today = new Date()

export const metadata: Metadata = {
  title: 'Keystone Blog',
  description: 'Blog posts from the team maintaining Keystone.',
  openGraph: {
    images: '/assets/blog/the-keystone-blog-cover.png' 
  }
}

export default async function Docs () {
  const keystaticPosts = await reader.collections.posts.all()

  const transformedPosts = keystaticPosts.map((post) => ({
    slug: post.slug,
    frontmatter: { ...post.entry, content: null },
  }))

  // Reverse chronologically sorted
  const sortedPosts = transformedPosts
    .map((p) => {
      const publishedDate = p.frontmatter.publishDate
      const parsedDate = parse(publishedDate, 'yyyy-M-d', today)
      const formattedDateStr = format(parsedDate, 'MMMM do, yyyy')
      return {
        ...p,
        frontmatter: { ...p.frontmatter },
        parsedDate: parsedDate,
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
