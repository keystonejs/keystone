/** @jsx jsx */

import { createContext, Fragment, useContext } from 'react';
import { ReactEditor, RenderElementProps } from 'slate-react';
import { Transforms } from 'slate';

import { jsx } from '@keystone-ui/core';
import { useKeystone } from '@keystone-next/admin-ui/context';
import { RelationshipSelect } from '@keystone-next/fields/types/relationship/views/RelationshipSelect';

import { ToolbarButton } from './primitives';
import { useStaticEditor } from './utils';
import { useToolbarState } from './toolbar-state';

export type Relationships = Record<
  string,
  {
    listKey: string;
    /** GraphQL fields to select when querying the field */
    selection: string | null;
    // TODO: remove the need for this
    /** This must be identical to the labelField of the list specified in the listKey */
    labelField: string;
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

const DocumentFieldRelationshipsContext = createContext<null | Relationships>(null);

export function useDocumentFieldRelationships() {
  let relationships = useContext(DocumentFieldRelationshipsContext);
  if (!relationships) {
    throw new Error(
      'DocumentFieldRelationshipsProvider must be used above call to useDocumentFieldRelationships'
    );
  }
  return relationships;
}

export const DocumentFieldRelationshipsProvider = DocumentFieldRelationshipsContext.Provider;

export function withRelationship(editor: ReactEditor) {
  const { isVoid, isInline } = editor;
  editor.isVoid = element => {
    return element.type === 'relationship' || isVoid(element);
  };
  editor.isInline = element => {
    return element.type === 'relationship' || isInline(element);
  };
  return editor;
}

export function RelationshipButton() {
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
            onClick={() => {
              Transforms.insertNodes(editor, {
                type: 'relationship',
                relationship: key,
                children: [{ text: '' }],
              });
            }}
          >
            {relationship.label}
          </ToolbarButton>
        );
      })}
    </Fragment>
  );
}

export function RelationshipElement({ attributes, children, element }: RenderElementProps) {
  const keystone = useKeystone();
  const editor = useStaticEditor();
  const relationships = useContext(DocumentFieldRelationshipsContext)!;
  const relationship = relationships[element.relationship as string] as Exclude<
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
            state={{
              kind: 'one',
              value: (element.data as any) || null,
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
