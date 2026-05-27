'use client'

import { type ExamplePageProps } from './page'
import { Markdoc } from '../../../../../components/Markdoc'
import { Heading } from '../../../../../components/docs/Heading'
import { type Tag } from '@markdoc/markdoc'

export default function PageClient (props: ExamplePageProps) {
  const readmeContent = JSON.parse(props.readmeContent) as Tag

  const tsCodeBlock = props.previewFile ? {
    '$$mdtype': 'Tag',
    name: 'CodeBlock',
    attributes: {
      content: props.previewFile.content,
      language: 'typescript'
    },
    children: []
  } : null

  return (
    <>
      {readmeContent.children.map((child, i) => (
        <Markdoc key={i} content={child} />
      ))}

      {tsCodeBlock && (
        <>
          <Heading level={2} id="preview-file-content">
            {props.previewFile?.fileName} Preview
          </Heading>
          <Markdoc content={tsCodeBlock} />
        </>
      )}

      {props.relatedDocs && (
        <>
          <Heading level={2} id="related-docs">
            Related Docs
          </Heading>
          <ul>
            {props.relatedDocs.map((doc, i) => (
              <li key={i}>
                <a href={`/docs/${doc}`}>{doc}</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}