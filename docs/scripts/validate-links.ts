import Markdoc from '@markdoc/markdoc'
import { getIdForHeading, baseMarkdocConfig, type Pages } from '../markdoc/config'
import { printValidationError } from '../markdoc'
import { loadAllMarkdoc } from '../markdoc/load-all'

// for the things that aren't Markdoc that are linked from Markdoc
const NON_MARKDOWN_PAGES = [
  '/docs/walkthroughs',
  '/updates/roadmap',
  '/docs/guides/document-field-demo',
  '/releases/2021-10-05',
  '/docs/examples',
  '/docs/guides/overview',
  '/docs/config/overview',
];

(async () => {
  const parsedFiles = (await loadAllMarkdoc()).map(({ file, contents }) => {
    const root = Markdoc.parse(contents, file)
    const ids = new Set<string>()
    for (const node of root.walk()) {
      if (node.type === 'heading') {
        const id = getIdForHeading(node)
        ids.add(id)
      }
    }
    return { root, ids, path: file.replace(/\.md$/, '') }
  })

  const pages: Pages = new Map(
    parsedFiles.map(({ path, ids }) => [path.replace(/^pages/, '').replace(/\.md$/, ''), { ids }])
  )
  for (const NON_MARKDOWN_PAGE of NON_MARKDOWN_PAGES) {
    pages.set(NON_MARKDOWN_PAGE, { ids: new Set() })
  }

  const markdocConfig = { ...baseMarkdocConfig, pages, variables: { nextRelease: false } }
  const errors = parsedFiles.flatMap(({ root }) => Markdoc.validate(root, markdocConfig))
  if (errors.length) {
    for (const error of errors) {
      console.error(printValidationError(error))
    }
    process.exitCode = 1
  }
})().catch(err => {
  console.error(err)
  process.exitCode = 1
})
