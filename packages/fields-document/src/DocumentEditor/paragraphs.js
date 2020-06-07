import { Transforms, Element, Node } from 'slate';

export const withParagraphs = editor => {
  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    const [node, path] = entry;

    // If the element is a paragraph, ensure its children are valid.
    if (Element.isElement(node)) {
      if (!node.type) {
        Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
        return;
      }
      if (!node.type || node.type === 'paragraph') {
        for (const [child, childPath] of Node.children(editor, path)) {
          if (Element.isElement(child) && !editor.isInline(child)) {
            Transforms.unwrapNodes(editor, { at: childPath });
            return;
          }
        }
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  return editor;
};
