import { Editor, Transforms } from 'slate';
import { HistoryEditor } from 'slate-history';
import { EditorAfterButIgnoringingPointsWithNoContent } from './utils';
import { getAncestorComponentChildFieldDocumentFeatures } from './toolbar-state';
import { DocumentFeatures } from '../views';
import { ComponentBlock } from './component-blocks/api';

const markdownLinkPattern = /(^|\s)\[(.+?)\]\((\S+)\)$/;

export function withMarkdownLinkShortcut<T extends HistoryEditor>(
  editorDocumentFeatures: DocumentFeatures,
  componentBlocks: Record<string, ComponentBlock>,
  editor: T
): T {
  if (!editorDocumentFeatures.links) return editor;
  const { insertText } = editor;
  editor.insertText = text => {
    insertText(text);
    if (text !== ')' || !editor.selection) return;
    const startOfBlock = Editor.start(
      editor,
      Editor.above(editor, { match: node => Editor.isBlock(editor, node) })![1]
    );

    const startOfBlockToEndOfShortcutString = Editor.string(editor, {
      anchor: editor.selection.anchor,
      focus: startOfBlock,
    });
    const match = markdownLinkPattern.exec(startOfBlockToEndOfShortcutString);
    if (!match) return;
    const ancestorComponentChildFieldDocumentFeatures = getAncestorComponentChildFieldDocumentFeatures(
      editor,
      editorDocumentFeatures,
      componentBlocks
    );
    if (ancestorComponentChildFieldDocumentFeatures?.documentFeatures.links === false) {
      return;
    }
    const [, maybeWhitespace, linkText, href] = match;
    // by doing this, the insertText(')') above will happen in a different undo than the link replacement
    // so that means that when someone does an undo after this
    // it will undo the the state of "[content](link)" rather than "[content](link" (note the missing closing bracket)
    editor.history.undos.push([]);
    const startOfShortcut =
      match.index === 0
        ? startOfBlock
        : EditorAfterButIgnoringingPointsWithNoContent(editor, startOfBlock, {
            distance: match.index,
          })!;
    const startOfLinkText = EditorAfterButIgnoringingPointsWithNoContent(editor, startOfShortcut, {
      distance: maybeWhitespace === '' ? 1 : 2,
    })!;
    const endOfLinkText = EditorAfterButIgnoringingPointsWithNoContent(editor, startOfLinkText, {
      distance: linkText.length,
    })!;

    Transforms.delete(editor, {
      at: { anchor: endOfLinkText, focus: editor.selection.anchor },
    });
    Transforms.delete(editor, {
      at: { anchor: startOfShortcut, focus: startOfLinkText },
    });

    Transforms.wrapNodes(
      editor,
      { type: 'link', href, children: [] },
      { at: { anchor: editor.selection.anchor, focus: startOfShortcut } }
    );
  };
  return editor;
}
