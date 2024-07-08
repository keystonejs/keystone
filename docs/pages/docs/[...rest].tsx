import React from 'react'
import {
  type GetStaticPathsResult,
  type GetStaticPropsContext,
  type GetStaticPropsResult,
  type InferGetStaticPropsType,
} from 'next'
import { useRouter } from 'next/router'
import { type DocsContent } from '../../markdoc'
import { extractHeadings, Markdoc } from '../../components/Markdoc'
import { DocsPage } from '../../components/Page'
import { Heading } from '../../components/docs/Heading'
import { reader } from '../../lib/keystatic-reader'
import { transform } from '@markdoc/markdoc'
import { baseMarkdocConfig } from '../../markdoc/config'

export default function DocPage (props: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()
  const headings = [
    { id: 'title', depth: 1, label: props.title },
    ...extractHeadings(props.content),
  ]
  return (
    <DocsPage
      headings={headings}
      title={props.title}
      description={props.description}
      editPath={`docs/${(router.query.rest as string[]).join('/')}.md`}
    >
      <Heading level={1} id="title">
        {props.title}
      </Heading>
      {props.content.children.map((child, i) => (
        <Markdoc key={i} content={child} />
      ))}
    </DocsPage>
  )
}

export async function getStaticPaths (): Promise<GetStaticPathsResult> {
  const pages = await reader.collections.docs.list()
  return {
    paths: pages.map(page => ({ params: { rest: page.split('/') } })),
    fallback: false,
  }
}

export async function getStaticProps (
  args: GetStaticPropsContext<{ rest: string[] }>
): Promise<GetStaticPropsResult<DocsContent>> {
  const doc = await reader.collections.docs.read(args.params!.rest.join('/'), {
    resolveLinkedFiles: true,
  })

  if (!doc) throw new Error(`Doc page not found: ${args.params!.rest.join('/')}`)

  const transformedContent = transform(doc.content.node, baseMarkdocConfig)

  return { props: { ...doc, content: JSON.parse(JSON.stringify(transformedContent)) } }
}
