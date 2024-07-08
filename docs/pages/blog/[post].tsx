/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react'
import { transform } from '@markdoc/markdoc'
import {
  type GetStaticPathsResult,
  type GetStaticPropsContext,
  type GetStaticPropsResult,
  type InferGetStaticPropsType,
} from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { parse, format } from 'date-fns'
import { type BlogContent } from '../../markdoc'
import { extractHeadings, Markdoc } from '../../components/Markdoc'
import { BlogPage } from '../../components/Page'
import { Heading } from '../../components/docs/Heading'
import { Type } from '../../components/primitives/Type'
import { getOgAbsoluteUrl } from '../../lib/og-util'
import { reader } from '../../lib/keystatic-reader'
import { baseMarkdocConfig } from '../../markdoc/config'

export default function Page (props: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()
  const headings = [
    { id: 'title', depth: 1, label: props.title },
    ...extractHeadings(props.content),
  ]

  const publishedDate = props.publishDate
  const parsedDate = parse(publishedDate, 'yyyy-M-d', new Date())
  const formattedDateStr = format(parsedDate, 'MMMM do, yyyy')

  let ogImageUrl = props.metaImageUrl
  if (!ogImageUrl) {
    ogImageUrl = getOgAbsoluteUrl({
      title: props.title,
      type: 'Blog',
    })
  }

  return (
    <BlogPage
      headings={headings}
      ogImage={ogImageUrl}
      title={props.title}
      description={props.description}
      editPath={`docs/${router.query.post}.md`}
    >
      <Heading level={1} id="title" css={{ marginBottom: 0 }}>
        {props.title}
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
          {props.authorHandle ? (
            <span>
              {' '}
              by{' '}
              <Link href={props.authorHandle} target="_blank">
                {props.authorName}
              </Link>
            </span>
          ) : (
            <span> by {props.authorName}</span>
          )}
        </em>
      </Type>
      {props.content.children.map((child, i) => (
        <Markdoc key={i} content={child} />
      ))}
    </BlogPage>
  )
}

export async function getStaticPaths (): Promise<GetStaticPathsResult> {
  const posts = await reader.collections.posts.list()
  return {
    paths: posts.map(post => ({ params: { post } })),
    fallback: false,
  }
}

type KeystaticPostsContent = Omit<BlogContent, 'authorHandle' | 'metaImageUrl'> & {
  authorHandle: string | null
  metaImageUrl: string | null
}

export async function getStaticProps (
  args: GetStaticPropsContext<{ post: string }>
): Promise<GetStaticPropsResult<KeystaticPostsContent>> {
  const keystaticPost = await reader.collections.posts.read(args.params!.post, {
    resolveLinkedFiles: true,
  })

  if (!keystaticPost) throw new Error(`Post not found: ${args.params!.post}`)

  const transformedContent = transform(keystaticPost.content.node, baseMarkdocConfig)

  return { props: { ...keystaticPost, content: JSON.parse(JSON.stringify(transformedContent)) } }
}
