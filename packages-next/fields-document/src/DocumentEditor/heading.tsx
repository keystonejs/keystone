/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { ReactEditor, RenderElementProps } from 'slate-react';

import { Editor, Transforms } from 'slate';

export const HeadingElement = ({ attributes, children, element }: RenderElementProps) => {
  const Tag = `h${element.level}`;
  return <Tag {...attributes}>{children}</Tag>;
};

export function withHeading(editor: ReactEditor) {
  const { insertBreak } = editor;
  editor.insertBreak = () => {
    insertBreak();
    const [match] = Editor.nodes(editor, {
      match: n => n.type === 'heading',
    });
    if (!match) return;
    const [, path] = match;
    Transforms.setNodes(
      editor,
      { type: 'paragraph', children: [{ text: '' }] },
      {
        at: path,
      }
    );
  };
  return editor;
}
