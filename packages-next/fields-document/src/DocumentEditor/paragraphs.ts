import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

export const paragraphElement = () => ({
  type: 'paragraph',
  children: [{ text: '' }],
});

export const withParagraphs = (editor: ReactEditor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    const [node, path] = entry;

    if (Editor.isEditor(node)) {
      let lastNode = node.children[node.children.length - 1];
      if (lastNode?.type !== 'paragraph') {
        Transforms.insertNodes(editor, paragraphElement(), {
          at: [...path, node.children.length],
        });
        return;
      }
    }

    normalizeNode(entry);
  };

  return editor;
};
