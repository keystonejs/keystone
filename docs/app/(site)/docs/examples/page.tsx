import { transform } from '@markdoc/markdoc'
import { DocsLayout } from '../../../../components/docs/DocsLayout'
import { reader } from '../../../../keystatic/reader'
import PageClient from './page-client'
import { baseMarkdocConfig } from '../../../../markdoc/config'

export const metadata = {
  title: 'Examples',
  description: 'A growing collection of projects you can run locally to learn more about Keystone’s many features. Use them as a reference for best practice, and springboard when adding features to your own project.',
}

export type GroupedExamples = Awaited<ReturnType<typeof getGroupedExamples>>

async function getGroupedExamples () {
  const examples = await reader.collections.examples.all({resolveLinkedFiles: true})
  const transformedExamples = await Promise.all(examples.map(async example => {
    return {
      ...example,
      entry : {
        ...example.entry,
        description: transform(example.entry.description.node, baseMarkdocConfig)
      }
    }
  }))

  const standaloneExamples = transformedExamples.filter(example => example.entry.kind === 'standalone')
  const endToEndExamples = transformedExamples.filter(example => example.entry.kind === 'end-to-end')
  const deploymentExamples = transformedExamples.filter(example => example.entry.kind === 'deployment')

  return {
    standaloneExamples,
    endToEndExamples,
    deploymentExamples
  }
}

export default async function Docs () {
  const pageData = await getGroupedExamples()
  return (
    <DocsLayout noRightNav noProse isIndexPage>
      <PageClient {...JSON.parse(JSON.stringify(pageData))} />
    </DocsLayout>
  )
}
