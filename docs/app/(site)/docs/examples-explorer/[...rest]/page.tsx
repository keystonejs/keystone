import { notFound } from 'next/navigation'
import { type Tag, transform } from '@markdoc/markdoc'
import fs from 'fs/promises'
import path from 'path'

import { reader } from '../../../../../keystatic/reader'
import { baseMarkdocConfig } from '../../../../../markdoc/config'
import { extractHeadings } from '../../../../../markdoc/headings'
import PageClient from './page-client'
import { ExamplesLayout } from '../../../../../components/examples/ExamplesLayout'

export type ExamplePageProps = {
  readmeContent: string  // Changed to string
  previewFile?: { content: string, fileName: string }
  relatedDocs?: string[]
}

type Params = { rest: string[] }

export default async function DocPage ({ params }: { params: Params }) {
  try {
    const doc = await reader.collections.examplesReadme.read(params.rest.join('/'), {
      resolveLinkedFiles: true,
    })
    if (!doc) return notFound()

    const transformedContent = transform(doc.README.node, baseMarkdocConfig) as Tag
    
    const preppedContent: ExamplePageProps = {
      readmeContent: JSON.stringify(transformedContent)  // Serialize the content
    }

    const headings = extractHeadings(transformedContent).slice(1)

    if (doc.previewFile?.discriminant === true && doc.previewFile.value?.fileName) {
      try {
        const dirPath = path.join(process.cwd(), 'examples', doc.exampleSlug)
        const tsFilePath = path.join(dirPath, doc.previewFile.value.fileName)
        const fileContent = await fs.readFile(tsFilePath, 'utf-8')
        preppedContent.previewFile = {
          content: fileContent,
          fileName: doc.previewFile.value.fileName
        }
        headings.push({ depth: 2, id: 'preview-file-content', label: `${doc.previewFile.value.fileName} Preview` })
      } catch (error) {
        console.error(`Error reading preview file: ${error}`)
      }
    }

    if (doc.relatedDocs && doc.relatedDocs.length > 0) {
      headings.push({ depth: 2, id: 'related-docs', label: 'Related Docs' })
      preppedContent.relatedDocs = doc.relatedDocs
    }

    return (
      <ExamplesLayout headings={headings} editPath={`docs/${params.rest.join('/')}.md`}>
        <PageClient {...preppedContent} />
      </ExamplesLayout>
    )
  } catch (error) {
    console.error(`Error in ExamplePage: ${error}`)
    return notFound()
  }
}

// Dynamic SEO page metadata
export async function generateMetadata ({ params }: { params: Params }) {
  try {
    const doc = await reader.collections.docs.read(params.rest.join('/'))
    return {
      title: doc?.title ? `${doc.title} - Keystone 6 Examples` : 'Keystone 6 Documentation',
      description: doc?.description,
    }
  } catch (error) {
    console.error(`Error generating metadata: ${error}`)
    return {
      title: 'Keystone 6 Documentation',
      description: 'An error occurred while loading this page',
    }
  }
}

// Static HTML page generation for each document page
export async function generateStaticParams () {
  try {
    const pages = await reader.collections.docs.list()
    return pages.map((page) => ({ rest: page.split('/') }))
  } catch (error) {
    console.error(`Error generating static params: ${error}`)
    return []
  }
}