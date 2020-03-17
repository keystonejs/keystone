import * as React from 'react';
import { isBlockActive } from '../utils';
import { type as defaultType } from './paragraph';
import { ToolbarButton } from '../toolbar-components';
import { Transforms } from 'slate';
import { useSlate, ReactEditor } from 'slate-react';

export const type = 'heading';

export const ToolbarElement = () => {
  const editor = useSlate();
  const hasHeading = isBlockActive(editor, type);

  return (
    <ToolbarButton
      icon={<span aria-hidden>H</span>}
      label="Heading"
      isActive={hasHeading}
      onClick={() => {
        if (hasHeading) {
          Transforms.setNodes(editor, { type: defaultType });
        } else {
          Transforms.setNodes(editor, { type });
        }

        ReactEditor.focus(editor);
      }}
    />
  );
};

export const Node = ({ attributes, children }) => {
  return <h2 {...attributes}>{children}</h2>;
};

export const getPlugin = () => editor => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    // Handle default behavior (splitting the node) first...
    insertBreak();

    // ...then transform the selected node into a paragraph.
    Transforms.setNodes(editor, { type: defaultType }, { match: n => n.type === type });
  };

  return editor;
};
