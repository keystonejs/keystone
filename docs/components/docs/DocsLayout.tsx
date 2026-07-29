import { DocsLayoutClient } from './DocsLayoutClient.tsx'
import { DocsNavigation } from './docs-navigation/index.tsx'

export async function DocsLayout(props) {
  return <DocsLayoutClient {...props} docsNavigation={<DocsNavigation />} />
}
