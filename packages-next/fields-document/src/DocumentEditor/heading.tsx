/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { RenderElementProps } from 'slate-react';

import { Editor, Transforms } from 'slate';

export const HeadingElement = ({ attributes, children, element }: RenderElementProps) => {
  const Tag = `h${element.level}` as 'h1';
  return (
    <Tag {...attributes} css={{ textAlign: element.textAlign as any }}>
      {children}
    </Tag>
  );
};

export function withHeading<T extends Editor>(editor: T): T {
  const { insertBreak } = editor;
  editor.insertBreak = () => {
    insertBreak();

    const entry = Editor.above(editor, {
      match: n => n.type === 'heading',
    });
    if (!entry) return;
    const [, path] = entry;
    Transforms.unwrapNodes(editor, {
      at: path,
    });
  };
  return editor;
}
