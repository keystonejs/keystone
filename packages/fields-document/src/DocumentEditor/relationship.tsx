/** @jsxRuntime classic */
/** @jsx jsx */

import { createContext, Fragment, useContext } from 'react'
import { ReactEditor, type RenderElementProps } from 'slate-react'
import { Transforms } from 'slate'
import { useSlateStatic as useStaticEditor } from 'slate-react'

import { jsx } from '@keystone-ui/core'
import { useList } from '@keystone-6/core/admin-ui/context'
import { RelationshipSelect } from '@keystone-6/core/fields/types/relationship/views/RelationshipSelect'

import { ToolbarButton } from './primitives'
import { useToolbarState } from './toolbar-state'

import { type Relationships } from './relationship-shared'
export { type Relationships } from './relationship-shared'

export const DocumentFieldRelationshipsContext = createContext<Relationships>({})

export function useDocumentFieldRelationships () {
  return useContext(DocumentFieldRelationshipsContext)
}

export const DocumentFieldRelationshipsProvider = DocumentFieldRelationshipsContext.Provider

export function RelationshipButton ({ onClose }: { onClose: () => void }) {
  const {
    editor,
    relationships: { isDisabled },
  } = useToolbarState()
  const relationships = useContext(DocumentFieldRelationshipsContext)!
  return (
    <Fragment>
      {Object.entries(relationships).map(([key, relationship]) => {
        return (
          <ToolbarButton
            key={key}
            isDisabled={isDisabled}
            onMouseDown={event => {
              event.preventDefault()
              Transforms.insertNodes(editor, {
                type: 'relationship',
                relationship: key,
                data: null,
                children: [{ text: '' }],
              })
              onClose()
            }}
          >
            {relationship.label}
          </ToolbarButton>
        )
      })}
    </Fragment>
  )
}

export function RelationshipElement ({
  attributes,
  children,
  element,
}: RenderElementProps & { element: { type: 'relationship' } }) {
  const editor = useStaticEditor()
  const relationships = useContext(DocumentFieldRelationshipsContext)!
  const relationship = relationships[element.relationship]
  const list = useList(relationship.listKey)
  const searchFields = Object.keys(list.fields).filter(key => list.fields[key].search)

  return (
    <span
      {...attributes}
      css={{
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      <span
        contentEditable={false}
        css={{
          userSelect: 'none',
          width: 200,
          display: 'inline-block',
          paddingLeft: 4,
          paddingRight: 4,
          flex: 1,
        }}
      >
        {relationship ? (
          <RelationshipSelect
            controlShouldRenderValue
            isDisabled={false}
            list={list}
            labelField={list.labelField}
            searchFields={searchFields}
            portalMenu
            state={{
              kind: 'one',
              value:
                element.data === null
                  ? null
                  : { id: element.data.id, label: element.data.label || element.data.id },
              onChange (value) {
                const at = ReactEditor.findPath(editor, element)
                if (value === null) {
                  Transforms.removeNodes(editor, { at })
                } else {
                  Transforms.setNodes(editor, { data: value }, { at })
                }
              },
            }}
          />
        ) : (
          'Invalid relationship'
        )}
      </span>
      <span css={{ flex: 0 }}>{children}</span>
    </span>
  )
}
