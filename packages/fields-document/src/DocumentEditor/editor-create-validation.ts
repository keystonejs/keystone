// this is same as editor-create-display, but does not import slate-react
// due to 'TypeError: ([...].createContext) is not a function' (when SSR)
import { createEditor } from 'slate'
import { withHistory } from 'slate-history'

import { type ComponentBlock } from './component-blocks/api-model'
import { type DocumentFeatures } from '../views'
import { withParagraphs } from './paragraphs'
import { withLink } from './link-model'
import { withLayouts } from './layouts-model'
import { withHeading } from './heading-model'
import { withList } from './lists-model'
import { withComponentBlocks } from './component-blocks/with-component-blocks'
import { withBlockquote } from './blockquote-model'
import { type Relationships, withRelationship } from './relationship-model'
import { withDivider } from './divider-model'
import { withCodeBlock } from './code-block-model'
import { withMarks } from './marks'
import { withSoftBreaks } from './soft-breaks'
import { withShortcuts } from './shortcuts'
import { withDocumentFeaturesNormalization } from './document-features-normalization'
import { withInsertMenu } from './insert-menu-model'
import { withBlockMarkdownShortcuts } from './block-markdown-shortcuts'
import { withPasting } from './pasting'
import { withBlocksSchema } from './editor-model'

export function createDocumentEditor(
  documentFeatures: DocumentFeatures,
  componentBlocks: Record<string, ComponentBlock>,
  relationships: Relationships
) {
  return withPasting(
    withSoftBreaks(
      withBlocksSchema(
        withLink(
          documentFeatures,
          componentBlocks,
          withList(
            withHeading(
              withRelationship(
                withInsertMenu(
                  withComponentBlocks(
                    componentBlocks,
                    documentFeatures,
                    relationships,
                    withParagraphs(
                      withShortcuts(
                        withDivider(
                          withLayouts(
                            withMarks(
                              documentFeatures,
                              componentBlocks,
                              withCodeBlock(
                                withBlockMarkdownShortcuts(
                                  documentFeatures,
                                  componentBlocks,
                                  withBlockquote(
                                    withDocumentFeaturesNormalization(
                                      documentFeatures,
                                      relationships,
                                      withHistory(createEditor())
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  )
}
