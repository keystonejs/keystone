/** @jsx jsx */

import { Button } from './components';
import { jsx } from '@keystone-ui/core';
import { createContext, Fragment, useContext } from 'react';
import { ReactEditor, RenderElementProps, useSlate } from 'slate-react';
import { Transforms } from 'slate';
import { RelationshipSelect } from '@keystone-next/fields/types/relationship/views/RelationshipSelect';
import { useKeystone } from '@keystone-next/admin-ui/src';

export type Relationships = Record<
  string,
  {
    label: string;
    listKey: string;
    kind: 'inline';
    // TODO: remove the need for this
    /** This must be identical to the labelField of the list specified in the listKey */
    labelField: string;
  }
>;

const DocumentFieldRelationshipsContext = createContext<null | Relationships>(null);

export const DocumentFieldRelationshipsProvider = DocumentFieldRelationshipsContext.Provider;

export function withRelationship(relationships: Relationships, editor: ReactEditor) {
  const { isVoid, isInline } = editor;
  editor.isVoid = element => {
    return element.type === 'relationship' || isVoid(element);
  };
  editor.isInline = element => {
    return (
      (element.type === 'relationship' &&
        relationships[element.relationship as string]?.kind === 'inline') ||
      isInline(element)
    );
  };
  return editor;
}

export function RelationshipButton() {
  const editor = useSlate();
  const relationships = useContext(DocumentFieldRelationshipsContext)!;
  return (
    <Fragment>
      {Object.entries(relationships).map(([key, relationship]) => {
        return (
          <Button
            key={key}
            onClick={() => {
              Transforms.insertNodes(editor, {
                type: 'relationship',
                relationship: key,
                children: [{ text: '' }],
              });
            }}
          >
            {relationship.label}
          </Button>
        );
      })}
    </Fragment>
  );
}

export function RelationshipElement({ attributes, children, element }: RenderElementProps) {
  const keystone = useKeystone();
  const editor = useSlate();
  const relationships = useContext(DocumentFieldRelationshipsContext)!;
  const relationship = relationships[element.relationship as string];
  return (
    <span {...attributes} css={{ display: 'inline-flex', alignItems: 'center' }}>
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
