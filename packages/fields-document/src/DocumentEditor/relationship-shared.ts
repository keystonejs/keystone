import type { Editor } from 'slate'

export type Relationships = Record<
  string,
  {
    listKey: string
    label: string
    labelField: string | null
    /** GraphQL fields to select when querying the field */
    selection: string | null
  }
>

export function withRelationship(editor: Editor): Editor {
  const { isVoid, isInline } = editor
  editor.isVoid = element => element.type === 'relationship' || isVoid(element)
  editor.isInline = element => element.type === 'relationship' || isInline(element)
  return editor
}
