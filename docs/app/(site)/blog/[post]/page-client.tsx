/** @jsxImportSource @emotion/react */

'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { parse, format } from 'date-fns'

import {  Markdoc } from '../../../../components/Markdoc'
import { BlogPage } from '../../../../components/Page'
import { Heading } from '../../../../components/docs/Heading'
import { Type } from '../../../../components/primitives/Type'
import { type BlogPost } from './page'
import { extractHeadings } from '../../../../markdoc/headings'

export default function Page ({ post }: { post: BlogPost }) {
  const params = useParams()
  const headings = [{ id: 'title', depth: 1, label: post.title }, ...extractHeadings(post.content)]

  const publishedDate = post.publishDate
  const parsedDate = parse(publishedDate, 'yyyy-M-d', new Date())
  const formattedDateStr = format(parsedDate, 'MMMM do, yyyy')

  return (
    <BlogPage headings={headings} editPath={`blog/${params?.post}.md`}>
      <Heading level={1} id="title" css={{ marginBottom: 0 }}>
        {post.title}
      </Heading>
      <Type
        as="p"
        id="author"
        look="body14"
        css={{
          marginTop: 'var(--space-large)',
          marginBottom: '0.66em',
          a: { textDecoration: 'none' },
        }}
      >
        <em>
          <span>Published on {formattedDateStr}</span>
          {post.authorHandle ? (
            <span>
              {' '}
              by{' '}
              <Link href={post.authorHandle} target="_blank">
                {post.authorName}
              </Link>
            </span>
          ) : (
            <span> by {post.authorName}</span>
          )}
        </em>
      </Type>
      {post.content.children.map((child, i) => (
        <Markdoc key={i} content={child} />
      ))}
    </BlogPage>
  )
}
