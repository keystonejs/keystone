/** @jsxRuntime classic */
/** @jsx jsx */

import { createContext, Fragment, useContext } from 'react';
import { ReactEditor, RenderElementProps } from 'slate-react';
import { Transforms, Editor } from 'slate';

import { jsx } from '@keystone-ui/core';
import { useKeystone } from '@keystone-next/keystone/admin-ui/context';
import { RelationshipSelect } from '@keystone-next/keystone/fields/types/relationship/views/RelationshipSelect';

import { ToolbarButton } from './primitives';
import { useStaticEditor } from './utils';
import { useToolbarState } from './toolbar-state';

export type Relationships = Record<
  string,
  {
    listKey: string;
    /** GraphQL fields to select when querying the field */
    selection: string | null;
  } & (
    | {
        kind: 'inline';
        label: string;
      }
    | {
        kind: 'prop';
        many: boolean;
      }
  )
>;

export const DocumentFieldRelationshipsContext = createContext<Relationships>({});

export function useDocumentFieldRelationships() {
  return useContext(DocumentFieldRelationshipsContext);
}

export const DocumentFieldRelationshipsProvider = DocumentFieldRelationshipsContext.Provider;

export function withRelationship(editor: Editor): Editor {
  const { isVoid, isInline } = editor;
  editor.isVoid = element => {
    return element.type === 'relationship' || isVoid(element);
  };
  editor.isInline = element => {
    return element.type === 'relationship' || isInline(element);
  };
  return editor;
}

export function RelationshipButton({ onClose }: { onClose: () => void }) {
  const {
    editor,
    relationships: { isDisabled },
  } = useToolbarState();
  const relationships = useContext(DocumentFieldRelationshipsContext)!;
  return (
    <Fragment>
      {Object.entries(relationships).map(([key, relationship]) => {
        if (relationship.kind === 'prop') return null;
        return (
          <ToolbarButton
            key={key}
            isDisabled={isDisabled}
            onMouseDown={event => {
              event.preventDefault();
              Transforms.insertNodes(editor, {
                type: 'relationship',
                relationship: key,
                data: null,
                children: [{ text: '' }],
              });
              onClose();
            }}
          >
            {relationship.label}
          </ToolbarButton>
        );
      })}
    </Fragment>
  );
}

export function RelationshipElement({
  attributes,
  children,
  element,
}: RenderElementProps & { element: { type: 'relationship' } }) {
  const keystone = useKeystone();
  const editor = useStaticEditor();
  const relationships = useContext(DocumentFieldRelationshipsContext)!;
  const relationship = relationships[element.relationship] as Exclude<
    Relationships[string],
    { kind: 'prop' }
  >;
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
            list={keystone.adminMeta.lists[relationship.listKey]}
            portalMenu
            state={{
              kind: 'one',
              value:
                element.data === null
                  ? null
                  : { id: element.data.id, label: element.data.label || element.data.id },
              onChange(value) {
                Transforms.setNodes(
                  editor,
                  { data: value },
                  { at: ReactEditor.findPath(editor, element) }
                );
              },
            }}
          />
        ) : (
          'Invalid relationship'
        )}
      </span>
      <span css={{ flex: 0 }}>{children}</span>
    </span>
  );
}
