import { Editor, Transforms, Range, Text, Point, Node, Path } from 'slate';
import { DocumentFeatures } from '../views';
import { ComponentBlock } from './component-blocks/api';
import { getAncestorComponentChildFieldDocumentFeatures } from './toolbar-state';
import { EditorAfterButIgnoringingPointsWithNoContent, Mark } from './utils';

export const allMarkdownShortcuts = {
  bold: ['**', '__'],
  italic: ['*', '_'],
  strikethrough: ['~~'],
  code: ['`'],
};

function applyMark(editor: Editor, mark: string, shortcutText: string, startOfStartPoint: Point) {
  // so that this starts a new undo group
  editor.history.undos.push([]);
  const startPointRef = Editor.pointRef(editor, startOfStartPoint);

  Transforms.delete(editor, {
    at: editor.selection!.anchor,
    distance: shortcutText.length,
    reverse: true,
  });
  Transforms.delete(editor, { at: startOfStartPoint, distance: shortcutText.length });

  Transforms.setNodes(
    editor,
    { [mark]: true },
    {
      match: Text.isText,
      split: true,
      at: { anchor: startPointRef.unref()!, focus: editor.selection!.anchor },
    }
  );
  // once you've ended the shortcut, you're done with the mark
  // so we need to remove it so the text you insert after doesn't have it
  editor.removeMark(mark);
}

export function withMarks(
  editorDocumentFeatures: DocumentFeatures,
  componentBlocks: Record<string, ComponentBlock>,
  editor: Editor
): Editor {
  const { insertText, insertBreak } = editor;

  editor.insertBreak = () => {
    insertBreak();
    const marksAfterInsertBreak = Editor.marks(editor);
    if (!marksAfterInsertBreak || !editor.selection) return;
    const parentBlock = Editor.above(editor, { match: node => Editor.isBlock(editor, node) });
    if (!parentBlock) return;
    const point = EditorAfterButIgnoringingPointsWithNoContent(editor, editor.selection.anchor);
    const marksAfterInsertBreakArr = Object.keys(
      marksAfterInsertBreak
    ) as (keyof typeof marksAfterInsertBreak)[];
    if (!point || !Path.isDescendant(point.path, parentBlock[1])) {
      for (const mark of marksAfterInsertBreakArr) {
        editor.removeMark(mark);
      }

      return;
    }
    const textNode = Node.get(editor, point.path) as Text;

    for (const mark of marksAfterInsertBreakArr) {
      if (!textNode[mark]) {
        editor.removeMark(mark);
      }
    }
  };

  const selectedMarkdownShortcuts: Partial<typeof allMarkdownShortcuts> = {};
  const enabledMarks = editorDocumentFeatures.formatting.inlineMarks;
  (Object.keys(allMarkdownShortcuts) as (keyof typeof allMarkdownShortcuts)[]).forEach(mark => {
    if (enabledMarks[mark]) {
      selectedMarkdownShortcuts[mark] = allMarkdownShortcuts[mark];
    }
  });

  if (Object.keys(selectedMarkdownShortcuts).length === 0) return editor;

  editor.insertText = text => {
    insertText(text);
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      for (const [mark, shortcuts] of Object.entries(selectedMarkdownShortcuts)) {
        for (const shortcutText of shortcuts!) {
          if (text === shortcutText[shortcutText.length - 1]) {
            // this function is not inlined because
            // https://github.com/swc-project/swc/issues/2622
            const startOfBlock = getStartOfBlock(editor);

            let startOfBlockToEndOfShortcutString = Editor.string(editor, {
              anchor: editor.selection.anchor,
              focus: startOfBlock,
            });
            const hasWhitespaceBeforeEndOfShortcut = /\s/.test(
              startOfBlockToEndOfShortcutString.substr(-shortcutText.length - 1, 1)
            );

            const endOfShortcutContainsExpectedContent =
              shortcutText === startOfBlockToEndOfShortcutString.slice(-shortcutText.length);

            if (hasWhitespaceBeforeEndOfShortcut || !endOfShortcutContainsExpectedContent) {
              continue;
            }

            const strToMatchOn = startOfBlockToEndOfShortcutString.slice(
              0,
              -shortcutText.length - 1
            );
            // TODO: use regex probs
            for (const [offsetFromStartOfBlock] of [...strToMatchOn].reverse().entries()) {
              const expectedShortcutText = strToMatchOn.substr(
                offsetFromStartOfBlock,
                shortcutText.length
              );
              if (expectedShortcutText !== shortcutText) {
                continue;
              }

              const startOfStartOfShortcut =
                offsetFromStartOfBlock === 0
                  ? startOfBlock
                  : EditorAfterButIgnoringingPointsWithNoContent(editor, startOfBlock, {
                      distance: offsetFromStartOfBlock,
                    })!;

              const endOfStartOfShortcut = Editor.after(editor, startOfStartOfShortcut, {
                distance: shortcutText.length,
              })!;

              if (
                offsetFromStartOfBlock !== 0 &&
                !/\s/.test(
                  Editor.string(editor, {
                    anchor: Editor.before(editor, startOfStartOfShortcut, { unit: 'character' })!,
                    focus: startOfStartOfShortcut,
                  })
                )
              ) {
                continue;
              }

              const contentBetweenShortcuts = Editor.string(editor, {
                anchor: endOfStartOfShortcut,
                focus: editor.selection.anchor,
              }).slice(0, -shortcutText.length);

              if (contentBetweenShortcuts === '' || /\s/.test(contentBetweenShortcuts[0])) {
                continue;
              }

              // this is a bit of a weird one
              // let's say you had <text>__thing _<cursor /></text> and you insert `_`.
              // without the below, that would turn into <text italic>_thing _<cursor /></text>
              // but it's probably meant to be bold but it's not because of the space before the ending _
              // there's probably a better way to do this but meh, this works
              if (
                mark === 'italic' &&
                (contentBetweenShortcuts[0] === '_' || contentBetweenShortcuts[0] === '*')
              ) {
                continue;
              }
              const ancestorComponentChildFieldDocumentFeatures =
                getAncestorComponentChildFieldDocumentFeatures(
                  editor,
                  editorDocumentFeatures,
                  componentBlocks
                );
              if (
                ancestorComponentChildFieldDocumentFeatures &&
                ancestorComponentChildFieldDocumentFeatures.inlineMarks !== 'inherit' &&
                ancestorComponentChildFieldDocumentFeatures.inlineMarks[mark as Mark] === false
              ) {
                continue;
              }
              applyMark(editor, mark, shortcutText, startOfStartOfShortcut);
              return;
            }
          }
        }
      }
    }
  };

  return editor;
}

function getStartOfBlock(editor: Editor) {
  return Editor.start(
    editor,
    Editor.above(editor, { match: node => Editor.isBlock(editor, node) })![1]
  );
}
