import { createContext, useContext } from 'react'
import { ReactEditor, type RenderElementProps } from 'slate-react'
import { Transforms } from 'slate'
import { useSlateStatic as useStaticEditor } from 'slate-react'

import { useList } from '@keystone-6/core/admin-ui/context'

import { ComboboxSingle } from '@keystone-6/core/fields/types/relationship/views'

import type { Relationships } from './relationship-shared'
import { css } from '@keystar/ui/style'
export type { Relationships } from './relationship-shared'

export const DocumentFieldRelationshipsContext = createContext<Relationships>({})

export function useDocumentFieldRelationships() {
  return useContext(DocumentFieldRelationshipsContext)
}

export const DocumentFieldRelationshipsProvider = DocumentFieldRelationshipsContext.Provider

export function RelationshipElement({
  attributes,
  children,
  element,
}: RenderElementProps & { element: { type: 'relationship' } }) {
  const editor = useStaticEditor()
  const relationships = useContext(DocumentFieldRelationshipsContext)!
  const relationship = relationships[element.relationship]
  const list = useList(relationship.listKey)

  return (
    <span
      {...attributes}
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
      })}
    >
      <span
        contentEditable={false}
        className={css({
          userSelect: 'none',
          width: 200,
          display: 'inline-block',
          paddingLeft: 4,
          paddingRight: 4,
          flex: 1,
        })}
      >
        {relationship ? (
          <ComboboxSingle
            list={list}
            labelField={list.labelField}
            searchFields={list.initialSearchFields}
            filter={list.initialFilter as any}
            sort={list.initialSort}
            state={{
              kind: 'one',
              value:
                element.data === null
                  ? null
                  : { id: element.data.id, label: element.data.label ?? null, built: undefined },
              onChange(newItem) {
                const at = ReactEditor.findPath(editor, element)
                if (newItem === null) {
                  Transforms.removeNodes(editor, { at })
                } else {
                  Transforms.setNodes(
                    editor,
                    { data: { id: newItem.id, label: newItem.label, data: newItem.data } },
                    { at }
                  )
                }
              },
            }}
          />
        ) : (
          'Invalid relationship'
        )}
      </span>
      <span className={css({ flex: 0 })}>{children}</span>
    </span>
  )
}
