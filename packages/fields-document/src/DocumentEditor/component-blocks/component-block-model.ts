import { Editor, Transforms } from 'slate'
import { type ComponentBlock } from '../../component-blocks'
import { insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading } from '../utils'
import { getInitialValue } from './initial-values'

export function insertComponentBlock(
  editor: Editor,
  componentBlocks: Record<string, ComponentBlock>,
  componentBlock: string
) {
  const node = getInitialValue(componentBlock, componentBlocks[componentBlock])
  insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, node)

  const componentBlockEntry = Editor.above(editor, {
    match: node => node.type === 'component-block',
  })

  if (componentBlockEntry) {
    const start = Editor.start(editor, componentBlockEntry[1])
    Transforms.setSelection(editor, { anchor: start, focus: start })
  }
}
