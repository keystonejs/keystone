import { Editor, Transforms, Range, Text, Node, Path, Point } from 'slate';
import { ReactEditor } from 'slate-react';
import { DocumentFeatures } from '../views';
import { ComponentBlock } from './component-blocks/api';
import { getAncestorComponentChildFieldDocumentFeatures } from './toolbar-state';
import { Mark } from './utils';

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
  startOfStartPoint: Point
) {
  const startPointRef = Editor.pointRef(editor, startOfStartPoint);

  const selectionPointRef = Editor.pointRef(editor, selectionPoint);

  Transforms.setNodes(
    editor,
    { [mark]: true },
    {
      match: Text.isText,
      split: true,
      at: { anchor: startOfStartPoint, focus: selectionPoint },
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
  // once you've ended the shortcut, you're done with the mark
  // so we need to remove it so the text you insert after doesn't have it
  editor.removeMark(mark);
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

// sooooooooooooooo, this is kinda weird
// what's going on is that we're searching through the result of Editor.string
// when we find the shortcut text we're expecting, we have an offset from the start of the block.
// you might be thinking
// "cool, just call Editor.after(editor, {distance: offsetFromStart}) and then you have the point for that character"
// but you'd be ✨😊✨ wrong ✨😊✨
// because you can have two points that refer to essentially the same position
// e.g. these two cursors are essentially in the same place but you could have it in either place
// <text bold>some text<cursor/></text><text italic>more text</text>
// <text bold>some text</text><text italic><cursor/>more text</text>
// you've also got void nodes which don't have text

// you could probably solve this problem more efficiently
// but i'd rather stick with an implementation that definitely works and is pretty simple to understand
// (if i were to implement this more efficently, i would probably write a different
// implementation of Editor.after that skips the positions that don't have text
// or implement the search differently so we have the points while searching)
function getPointAtOffsetFromStartOfBlock(
  editor: Editor,
  offsetFromStart: number,
  maybeRightPoint: Point,
  startOfBlock: Point
): Point {
  const str = Editor.string(editor, { anchor: startOfBlock, focus: maybeRightPoint });
  if (str.length === offsetFromStart) {
    return maybeRightPoint;
  }
  return getPointAtOffsetFromStartOfBlock(
    editor,
    offsetFromStart,
    Editor.after(editor, maybeRightPoint)!,
    startOfBlock
  );
}

export const withMarks = (
  editorDocumentFeatures: DocumentFeatures,
  componentBlocks: Record<string, ComponentBlock>,
  editor: ReactEditor
) => {
  const selectedMarkdownShortcuts: Partial<typeof allMarkdownShortcuts> = {};
  const enabledMarks = editorDocumentFeatures.formatting.inlineMarks;
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
            const startOfBlock = Editor.start(
              editor,
              Editor.above(editor, { match: node => Editor.isBlock(editor, node) })![1]
            );

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
                  : getPointAtOffsetFromStartOfBlock(
                      editor,
                      offsetFromStartOfBlock,
                      Editor.after(editor, startOfBlock, {
                        distance: offsetFromStartOfBlock,
                      })!,
                      startOfBlock
                    );

              const endOfStartOfShortcut = Editor.after(editor, startOfStartOfShortcut, {
                distance: shortcutText.length,
              })!;

              if (!isAtStartOfBlockOrThereIsWhitespaceBeforePoint(editor, startOfStartOfShortcut)) {
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
              const ancestorComponentChildFieldDocumentFeatures = getAncestorComponentChildFieldDocumentFeatures(
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
              applyMark(
                editor,
                editor.selection.anchor,
                mark,
                shortcutText,
                startOfStartOfShortcut
              );
              return;
            }
          }
        }
      }
    }
  };

  return editor;
};
