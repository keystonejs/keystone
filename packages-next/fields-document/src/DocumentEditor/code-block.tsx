import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

export function insertCodeBlock(editor: ReactEditor) {
  Transforms.wrapNodes(editor, { type: 'code', children: [{ text: '' }] });
  Transforms.unwrapNodes(editor, {
    match: node => Editor.isBlock(editor, node) && node.type !== 'code',
  });
}

export function withCodeBlock(editor: ReactEditor) {
  const { insertBreak } = editor;
  editor.insertBreak = () => {
    const [node] = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
    }) || [editor, []];
    if (node.type === 'code') {
      editor.insertText('\n');
      return;
    }
    insertBreak();
  };
  return editor;
}
