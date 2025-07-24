import type { Editor } from 'slate'

// inline relationship type
export type Relationships = Record<
  string,
  {
    listKey: string
    label: string
    /** The label field to use for this relationship when showing the select */
    labelField: string | null
    /** The GraphQL selection to use for this relationship when hydrating .data */
    selection: string | null
  }
>

export function withRelationship(editor: Editor): Editor {
  const { isVoid, isInline } = editor
  editor.isVoid = element => element.type === 'relationship' || isVoid(element)
  editor.isInline = element => element.type === 'relationship' || isInline(element)
  return editor
}
