import { history } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import type { Mark, Node } from 'prosemirror-model'
import type { Selection } from 'prosemirror-state'
import { EditorState } from 'prosemirror-state'
import { tableEditing } from 'prosemirror-tables'

import { tokenSchema } from '@keystar/ui/style'

import { autocompleteDecoration } from './autocomplete/decoration'
import { keymapForSchema } from './commands/keymap'
import { dropCursor } from './dropcursor'
import { gapCursor } from './gapcursor'
import { imageDropPlugin } from './images'
import { inputRules } from './inputrules/inputrules'
import { enterInputRulesForSchema, inputRulesForSchema } from './inputrules/rules'
import { keydownHandler } from './keydown'
import { pasteLinks } from './links'
import { markdocClipboard } from './markdoc/clipboard'
import { nodeInSelectionDecorations } from './node-in-selection'
import { placeholderPlugin } from './placeholder'
import { tableCellMenuPlugin } from './popovers/table'
import { reactNodeViews } from './react-node-views'
import { getEditorSchema } from './schema'

export function createEditorState(
  doc: Node,
  selection?: Selection,
  storedMarks?: readonly Mark[] | null
) {
  const schema = getEditorSchema(doc.type.schema)
  return EditorState.create({
    selection,
    storedMarks,
    plugins: [
      pasteLinks(schema),
      imageDropPlugin(schema),
      keydownHandler(),
      history(),
      dropCursor({
        color: tokenSchema.color.alias.borderSelected,
        width: 2,
      }),
      inputRules({
        rules: inputRulesForSchema(schema),
        enterRules: enterInputRulesForSchema(schema),
      }),
      gapCursor(),
      keymap(keymapForSchema(schema)),
      markdocClipboard(),
      nodeInSelectionDecorations(),
      placeholderPlugin('Start writing or press "/" for commands…'),
      reactNodeViews(doc.type.schema),
      autocompleteDecoration(),
      tableEditing(),
      tableCellMenuPlugin(),
    ],
    doc,
  })
}
