/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { ReactEditor, RenderElementProps } from 'slate-react';

import { Editor, Transforms } from 'slate';

export const HeadingElement = ({ attributes, children, element }: RenderElementProps) => {
  const Tag = `h${element.level}` as 'h1';
  return (
    <Tag {...attributes} css={{ textAlign: element.textAlign as any }}>
      {children}
    </Tag>
  );
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
    Transforms.unwrapNodes(editor, {
      at: path,
    });
  };
  return editor;
}
