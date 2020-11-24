import { Transforms, Range, Editor } from 'slate';
import { ReactEditor } from 'slate-react';

export function withDivider(enabled: boolean, editor: ReactEditor) {
  const { isVoid, insertText } = editor;
  editor.isVoid = node => {
    return node.type === 'divider' || isVoid(node);
  };
  if (enabled) {
    // this is slightly different to the usages of getMaybeMarkdownShortcutText because
    editor.insertText = text => {
      const { selection } = editor;
      if (text === '-' && selection && Range.isCollapsed(selection)) {
        const { anchor } = selection;
        const block = Editor.above(editor, {
          match: n => n.type === 'paragraph',
        });
        const path = block ? block[1] : [];
        const start = Editor.start(editor, path);
        const range = { anchor, focus: start };
        const content = Editor.string(editor, range);
        if (content === '--') {
          Transforms.select(editor, range);
          Transforms.delete(editor);
          Transforms.insertNodes(
            editor,
            { type: 'divider', children: [{ text: '' }] },
            { at: path }
          );
          return;
        }
      }
      insertText(text);
    };
  }
  return editor;
}
