'use client'

import { useParams } from 'next/navigation'

import { type Document } from './page'

import { extractHeadings, Markdoc } from '../../../../components/Markdoc'

import { Heading } from '../../../../components/docs/Heading'

export default function PageClient ({ document }: { document: Document }) {
  const params = useParams()

  const headings = [
    { id: 'title', depth: 1, label: document.title },
    ...extractHeadings(document.content),
  ]

  return (
    <>
      <Heading level={1} id="title">
        {document.title}
      </Heading>

      {document.content.children.map((child, i) => (
        <Markdoc key={i} content={child} />
      ))}
    </>
  )
}
