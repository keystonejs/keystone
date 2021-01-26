import { Editor, Transforms } from 'slate';

export const paragraphElement = () => ({
  type: 'paragraph',
  children: [{ text: '' }],
});

export function withParagraphs<T extends Editor>(editor: T): T {
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
}
