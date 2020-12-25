/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { ReactEditor, RenderElementProps } from 'slate-react';

import { Editor, Transforms } from 'slate';
import { getMaybeMarkdownShortcutText } from './utils';

export const HeadingElement = ({ attributes, children, element }: RenderElementProps) => {
  const Tag = `h${element.level}`;
  return <Tag {...attributes}>{children}</Tag>;
};

export function withHeading(headingLevels: (1 | 2 | 3 | 4 | 5 | 6)[], editor: ReactEditor) {
  const { insertBreak, insertText } = editor;
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
  if (headingLevels.length) {
    const shortcuts: Record<string, number> = {};
    headingLevels.forEach(value => {
      shortcuts['#'.repeat(value)] = value;
    });
    editor.insertText = text => {
      const [shortcutText, deleteShortcutText] = getMaybeMarkdownShortcutText(
        text,
        editor,
        node => node.type === 'paragraph' || node.type === 'heading'
      );
      if (shortcutText && shortcuts[shortcutText] !== undefined) {
        deleteShortcutText();
        Transforms.setNodes(
          editor,
          { type: 'heading', level: shortcuts[shortcutText] },
          { match: node => node.type === 'paragraph' || node.type === 'heading' }
        );
        return;
      }
      insertText(text);
    };
  }
  return editor;
}
