'use client'

import { type Document } from './page'

import {  Markdoc } from '../../../../components/Markdoc'

import { Heading } from '../../../../components/docs/Heading'

export default function PageClient ({ document }: { document: Document }) {
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
