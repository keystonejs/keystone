import { Editor, Transforms, Element, Text, Range } from 'slate';
import { ReactEditor } from 'slate-react';

export function insertCodeBlock(editor: ReactEditor) {
  Transforms.wrapNodes(editor, { type: 'code', children: [{ text: '' }] });
}

export function withCodeBlock(enabled: boolean, editor: ReactEditor) {
  const { insertBreak, normalizeNode, insertText } = editor;
  editor.insertBreak = () => {
    const [node, path] = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
    }) || [editor, []];
    if (node.type === 'code') {
      const text = node.children[0].text as string;
      if (text[text.length - 1] === '\n') {
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
        // debugger;
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
  if (enabled) {
    // this is slightly different to the usages of getMaybeMarkdownShortcutText because the insertion happens on ` rather than a space
    editor.insertText = text => {
      const { selection } = editor;
      if (text === '`' && selection && Range.isCollapsed(selection)) {
        const { anchor } = selection;
        const block = Editor.above(editor, {
          match: n => n.type === 'paragraph',
        });
        const path = block ? block[1] : [];
        const start = Editor.start(editor, path);
        const range = { anchor, focus: start };
        const content = Editor.string(editor, range);
        if (content === '``') {
          Transforms.select(editor, range);
          Transforms.delete(editor);
          Transforms.wrapNodes(editor, { type: 'code', children: [] }, { at: path });
          return;
        }
      }
      insertText(text);
    };
  }
  return editor;
}
