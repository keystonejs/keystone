import { ExamplesLayoutClient } from './ExamplesLayoutClient'
import { DocsNavigation } from '../docs/docs-navigation'

export async function ExamplesLayout (props) {
  return <ExamplesLayoutClient {...props} docsNavigation={<DocsNavigation />} />
}
