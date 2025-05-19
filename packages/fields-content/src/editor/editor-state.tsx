import { history } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import type { Mark, Node } from 'prosemirror-model'
import type { Selection } from 'prosemirror-state'
import { EditorState } from 'prosemirror-state'
import { tableEditing } from 'prosemirror-tables'

import { tokenSchema } from '@keystar/ui/style'

import { autocompleteDecoration } from './autocomplete/decoration.tsx'
import { keymapForSchema } from './commands/keymap.ts'
import { dropCursor } from './dropcursor.ts'
import { gapCursor } from './gapcursor/index.ts'
import { imageDropPlugin } from './images.tsx'
import { inputRules } from './inputrules/inputrules.ts'
import { enterInputRulesForSchema, inputRulesForSchema } from './inputrules/rules.ts'
import { keydownHandler } from './keydown.ts'
import { pasteLinks } from './links.tsx'
import { markdocClipboard } from './markdoc/clipboard.tsx'
import { nodeInSelectionDecorations } from './node-in-selection.ts'
import { placeholderPlugin } from './placeholder.ts'
import { tableCellMenuPlugin } from './popovers/table.tsx'
import { reactNodeViews } from './react-node-views.tsx'
import { getEditorSchema } from './schema.tsx'

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
