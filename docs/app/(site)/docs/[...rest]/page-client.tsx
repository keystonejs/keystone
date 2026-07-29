'use client'

import type { Document } from './page.tsx'

import { Markdoc } from '../../../../components/Markdoc.tsx'

import { Heading } from '../../../../components/docs/Heading.tsx'

export default function PageClient({ document }: { document: Document }) {
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
