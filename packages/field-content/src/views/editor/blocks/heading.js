import * as React from 'react';
import { hasBlock } from '../utils';
import { type as defaultType } from './paragraph';
import { ToolbarButton } from '../toolbar-components';
import { Transforms } from 'slate';

export const type = 'heading';

export function ToolbarElement({ editor, editorState }) {
  return (
    <ToolbarButton
      icon={<span aria-hidden>H</span>}
      label="Heading"
      isActive={hasBlock(editorState, type)}
      onClick={() => {
        if (hasBlock(editorState, type)) {
          editor.setBlocks({ type: defaultType });
        } else {
          editor.setBlocks({ type: type });
        }
        editor.focus();
      }}
    />
  );
}

export function Node({ attributes, children }) {
  return <h2 {...attributes}>{children}</h2>;
}

const withHeaderPlugin = editor => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    // Handle default behavior (splitting the node) first...
    insertBreak();

    // ...then transform the selected node into a paragraph.
    Transforms.setNodes(editor, { type: defaultType }, { match: n => n.type === type });
  };

  return editor;
};

export const getPluginsNew = () => [withHeaderPlugin];
