import { Descendant, Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { deserializeHTML } from './html';
import { deserializeMarkdown } from './markdown';

function insertFragmentButDifferent(editor: ReactEditor, nodes: Descendant[]) {
  if (Editor.isBlock(editor, nodes[0])) {
    Transforms.insertNodes(editor, nodes);
  } else {
    Transforms.insertFragment(editor, nodes);
  }
}

export function withPasting(editor: ReactEditor) {
  const { insertData } = editor;

  editor.insertData = data => {
    let vsCodeEditorData = data.getData('vscode-editor-data');
    if (vsCodeEditorData) {
      try {
        const vsCodeData = JSON.parse(vsCodeEditorData);
        if (vsCodeData?.mode === 'markdown' || vsCodeData?.mode === 'mdx') {
          const blockAbove = Editor.above(editor, { match: node => Editor.isBlock(editor, node) });
          if (blockAbove?.[0].type !== 'code') {
            const plain = data.getData('text/plain');
            if (plain) {
              const fragment = deserializeMarkdown(plain);
              insertFragmentButDifferent(editor, fragment);
              return;
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    }

    debugger;

    let html = data.getData('text/html');

    if (html) {
      const fragment = deserializeHTML(html);
      insertFragmentButDifferent(editor, fragment);
      return;
    }

    const plain = data.getData('text/plain');
    if (plain) {
      const fragment = deserializeMarkdown(plain);
      insertFragmentButDifferent(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
}
