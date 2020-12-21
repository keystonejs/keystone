import { Editor, Transforms, Range, Text, Node, Path, Point } from 'slate';
import { ReactEditor } from 'slate-react';
import { DocumentFeatures } from '../views';

export const allMarkdownShortcuts = {
  bold: ['**', '__'],
  italic: ['*', '_'],
  strikethrough: ['~~'],
  code: ['`'],
};

function applyMark(
  editor: ReactEditor,
  selectionPoint: Point,
  mark: string,
  shortcutText: string,
  startRange: [Point, Point]
) {
  const startPointRef = Editor.pointRef(editor, startRange[0]);

  const selectionPointRef = Editor.pointRef(editor, selectionPoint);

  Transforms.setNodes(
    editor,
    { [mark]: true },
    {
      match: Text.isText,
      split: true,
      at: { anchor: startRange[0], focus: selectionPoint },
    }
  );
  const startPointAfterMarkSet = startPointRef.unref();
  if (startPointAfterMarkSet) {
    Transforms.delete(editor, { at: startPointAfterMarkSet, distance: shortcutText.length });
  }
  const selectionPointAfterMarkSet = selectionPointRef.unref();
  if (selectionPointAfterMarkSet) {
    Transforms.delete(editor, {
      at: {
        anchor: Editor.before(editor, selectionPointAfterMarkSet, {
          distance: shortcutText.length,
        })!,
        focus: selectionPointAfterMarkSet,
      },
    });
  }
}

function isAtStartOfBlockOrThereIsWhitespaceBeforePoint(editor: ReactEditor, point: Point) {
  const pointBeforePoint = Editor.before(editor, point);

  // we're the start of the editor and there isn't anything before us
  if (!pointBeforePoint) {
    return true;
  }

  const pathToBlockAbovePoint = Editor.above(editor, {
    at: pointBeforePoint.path,
    match: node => Editor.isBlock(editor, node),
  })![1];

  const pathToPointAboveSelection = Editor.above(editor, {
    match: node => Editor.isBlock(editor, node),
  })![1];

  const isPointBeforePointPartOfBlockInSelection = Path.equals(
    pathToBlockAbovePoint,
    pathToPointAboveSelection
  );
  // the point before the given point is in the previous block
  // so we're at the start of our block
  if (!isPointBeforePointPartOfBlockInSelection) {
    return true;
  }
  const text = (Node.get(editor, pointBeforePoint.path) as Text).text[pointBeforePoint.offset];
  // yes, this could be simplified to return the result of test
  // but it's useful to have breakpoints for a particular case
  if (/\s/.test(text)) {
    return true;
  }
  return false;
}

export const withMarks = (enabledMarks: DocumentFeatures['inlineMarks'], editor: ReactEditor) => {
  const selectedMarkdownShortcuts: Partial<typeof allMarkdownShortcuts> = {};

  (Object.keys(allMarkdownShortcuts) as (keyof typeof allMarkdownShortcuts)[]).forEach(mark => {
    if (enabledMarks[mark]) {
      selectedMarkdownShortcuts[mark] = allMarkdownShortcuts[mark];
    }
  });

  if (Object.keys(selectedMarkdownShortcuts).length === 0) return editor;

  const { insertText } = editor;

  editor.insertText = text => {
    insertText(text);
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      for (const [mark, shortcuts] of Object.entries(selectedMarkdownShortcuts)) {
        for (const shortcutText of shortcuts!) {
          if (text === shortcutText[shortcutText.length - 1]) {
            const before = Editor.before(editor, editor.selection.anchor, {
              unit: 'offset',
              distance: shortcutText.length + 1,
            });
            if (!before) continue;
            const beforeEndOfShortcutString = Editor.string(editor, {
              anchor: editor.selection.anchor,
              focus: before,
            });
            const hasWhitespaceBeforeEndOfShortcut = /\s/.test(beforeEndOfShortcutString[0]);
            const endOfShortcutContainsExpectedContent =
              shortcutText === beforeEndOfShortcutString.slice(1);

            if (hasWhitespaceBeforeEndOfShortcut || !endOfShortcutContainsExpectedContent) {
              continue;
            }

            const startOfBlock = Editor.start(
              editor,
              Editor.above(editor, { match: node => Editor.isBlock(editor, node) })![1]
            );

            const strToMatchOn = Editor.string(editor, {
              anchor: startOfBlock,
              focus: before,
            });
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
                  : Editor.after(editor, startOfBlock, {
                      distance: offsetFromStartOfBlock,
                    })!;

              const endOfStartOfShortcut = Editor.after(editor, startOfStartOfShortcut, {
                distance: shortcutText.length,
              })!;

              if (!isAtStartOfBlockOrThereIsWhitespaceBeforePoint(editor, startOfStartOfShortcut)) {
                continue;
              }

              const contentBetweenShortcuts = Editor.string(editor, {
                anchor: endOfStartOfShortcut,
                focus: Editor.after(editor, before)!,
              });

              if (
                contentBetweenShortcuts === '' ||
                /\s/.test(contentBetweenShortcuts[0]) ||
                /\s/.test(contentBetweenShortcuts.substr(-shortcutText.length, 1))
              ) {
                continue;
              }

              // TODO: is this actually worth handling?
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
              applyMark(editor, editor.selection.anchor, mark, shortcutText, [
                startOfStartOfShortcut,
                endOfStartOfShortcut,
              ]);
              return;
            }
          }
        }
      }
    }
  };

  return editor;
};
