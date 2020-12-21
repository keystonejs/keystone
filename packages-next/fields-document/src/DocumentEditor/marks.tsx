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
  const startRangeRef = Editor.rangeRef(editor, {
    anchor: startRange[0],
    focus: startRange[1],
  });

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
  const startRangeAfterMarkSet = startRangeRef.unref();
  if (startRangeAfterMarkSet) {
    Transforms.delete(editor, { at: startRangeAfterMarkSet });
  }
  const selectionPointAfterMarkSet = selectionPointRef.unref();
  if (selectionPointAfterMarkSet) {
    Transforms.delete(editor, {
      at: {
        anchor: {
          path: selectionPointAfterMarkSet.path,
          offset: selectionPointAfterMarkSet.offset - shortcutText.length,
        },
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

            for (const [text, path] of Editor.nodes(editor, {
              match: Text.isText,
              at: {
                anchor: Editor.start(
                  editor,
                  Editor.above(editor, { match: node => Editor.isBlock(editor, node) })![1]
                ),
                focus: before,
              },
              reverse: true,
            })) {
              const index = text.text.indexOf(shortcutText);
              if (index === -1) continue;
              const startOfStartOfShortcut = { path, offset: index };

              if (!isAtStartOfBlockOrThereIsWhitespaceBeforePoint(editor, startOfStartOfShortcut)) {
                continue;
              }

              const endOfStartOfShortcutPoint = { path, offset: index + shortcutText.length };

              const contentBetweenShortcuts = Editor.string(editor, {
                anchor: endOfStartOfShortcutPoint,
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
                endOfStartOfShortcutPoint,
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
