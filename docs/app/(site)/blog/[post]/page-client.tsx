/** @jsxImportSource @emotion/react */

'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Markdoc } from '../../../../components/Markdoc.tsx'
import { BlogPage } from '../../../../components/Page.tsx'
import { Heading } from '../../../../components/docs/Heading.tsx'
import { Type } from '../../../../components/primitives/Type.tsx'
import type { BlogPost } from './page.tsx'
import { extractHeadings } from '../../../../markdoc/headings.ts'

export default function Page({ post, formattedDate }: { post: BlogPost; formattedDate: string }) {
  const params = useParams()
  const headings = [{ id: 'title', depth: 1, label: post.title }, ...extractHeadings(post.content)]

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
          <span>Published on {formattedDate}</span>
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
