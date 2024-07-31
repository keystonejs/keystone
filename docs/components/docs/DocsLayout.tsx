import { DocsLayoutClient } from './DocsLayoutClient'
import { DocsNavigation } from './docs-navigation'

export async function DocsLayout (props) {
  return <DocsLayoutClient {...props} docsNavigation={<DocsNavigation />} />
}
