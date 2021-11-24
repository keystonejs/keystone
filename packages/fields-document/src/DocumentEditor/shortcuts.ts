import { Range, Editor, Transforms, Path } from 'slate';

export const shortcuts: Record<string, string> = {
  '...': '…',
  '-->': '→',
  '->': '→',
  '<-': '←',
  '<--': '←',
  '--': '–',
};

export function withShortcuts(editor: Editor): Editor {
  const { insertText } = editor;
  editor.insertText = text => {
    insertText(text);
    if (text === ' ' && editor.selection && Range.isCollapsed(editor.selection)) {
      const selectionPoint = editor.selection.anchor;
      const ancestorBlock = Editor.above(editor, { match: node => Editor.isBlock(editor, node) });
      if (ancestorBlock) {
        Object.keys(shortcuts).forEach(shortcut => {
          const pointBefore = Editor.before(editor, selectionPoint, {
            unit: 'character',
            distance: shortcut.length + 1,
          });
          if (pointBefore && Path.isDescendant(pointBefore.path, ancestorBlock[1])) {
            const range = { anchor: selectionPoint, focus: pointBefore };
            const str = Editor.string(editor, range);
            if (str.substr(0, shortcut.length) === shortcut) {
              editor.history.undos.push([]);
              Transforms.select(editor, range);
              editor.insertText(shortcuts[shortcut] + ' ');
            }
          }
        });
      }
    }
  };
  return editor;
}
