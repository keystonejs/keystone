import { Editor, Transforms, Element, Text, Range, Point } from 'slate';
import { ReactEditor } from 'slate-react';

export function insertCodeBlock(editor: ReactEditor) {
  Transforms.wrapNodes(editor, { type: 'code', children: [{ text: '' }] });
}

export function withCodeBlock(editor: ReactEditor) {
  const { insertBreak, normalizeNode } = editor;

  editor.insertBreak = () => {
    const [node, path] = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
    }) || [editor, []];
    if (node.type === 'code') {
      const text = node.children[0].text as string;
      if (
        text[text.length - 1] === '\n' &&
        editor.selection &&
        Range.isCollapsed(editor.selection) &&
        Point.equals(Editor.end(editor, path), editor.selection.anchor)
      ) {
        insertBreak();
        Transforms.setNodes(editor, { type: 'paragraph', children: [] });
        Transforms.delete(editor, {
          distance: 1,
          at: { path: [...path, 0], offset: text.length - 1 },
        });
        return;
      }
      editor.insertText('\n');
      return;
    }
    insertBreak();
  };
  editor.normalizeNode = ([node, path]) => {
    if (node.type === 'code' && Element.isElement(node)) {
      for (const [index, childNode] of node.children.entries()) {
        if (!Text.isText(childNode)) {
          if (editor.isVoid(childNode)) {
            Transforms.removeNodes(editor, { at: [...path, index] });
          } else {
            Transforms.unwrapNodes(editor, { at: [...path, index] });
          }
          return;
        }
        const marks = Object.keys(childNode).filter(x => x !== 'text');
        if (marks.length) {
          Transforms.unsetNodes(editor, marks, { at: [...path, index] });
          return;
        }
      }
    }
    normalizeNode([node, path]);
  };

  return editor;
}
