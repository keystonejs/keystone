import type { ListSortDescriptor } from '@keystone-6/core/types'
import type { Editor } from 'slate'

// inline relationship type (used by and duplicated in fields-document/src/index)
export type Relationships = Record<
  string,
  {
    listKey: string
    label: string
    labelField: string | null
    selection: string | null
    filter: Record<string, any> | null
    sort: ListSortDescriptor<string> | null
  }
>

export function withRelationship(editor: Editor): Editor {
  const { isVoid, isInline } = editor
  editor.isVoid = element => element.type === 'relationship' || isVoid(element)
  editor.isInline = element => element.type === 'relationship' || isInline(element)
  return editor
}
