import { Editor, Transforms, Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { DocumentFeatures } from '../views';
import { ComponentBlock } from './component-blocks/api';

export function withBlockMarkdownShortcuts(
  documentFeatures: DocumentFeatures,
  componentBlocks: Record<string, ComponentBlock>,
  editor: ReactEditor
) {
  const { insertText } = editor;
  const shortcuts: Record<
    string,
    Record<string, { insert: () => void; type: 'paragraph' | 'heading-or-paragraph' }>
  > = Object.create(null);
  let addShortcut = (
    text: string,
    insert: () => void,
    type: 'paragraph' | 'heading-or-paragraph' = 'paragraph'
  ) => {
    const trigger = text[text.length - 1];
    if (!shortcuts[trigger]) {
      shortcuts[trigger] = Object.create(null);
    }
    shortcuts[trigger][text] = {
      insert,
      type,
    };
  };
  if (documentFeatures.formatting.listTypes.ordered) {
    addShortcut('1. ', () => {
      Transforms.wrapNodes(
        editor,
        { type: 'ordered-list', children: [] },
        { match: n => Editor.isBlock(editor, n) }
      );
    });
  }
  if (documentFeatures.formatting.listTypes.unordered) {
    addShortcut('- ', () => {
      Transforms.wrapNodes(
        editor,
        { type: 'unordered-list', children: [] },
        { match: n => Editor.isBlock(editor, n) }
      );
    });
  }

  documentFeatures.formatting.headingLevels.forEach(level => {
    addShortcut(
      '#'.repeat(level) + ' ',
      () => {
        Transforms.setNodes(
          editor,
          { type: 'heading', level },
          { match: node => node.type === 'paragraph' || node.type === 'heading' }
        );
      },
      'heading-or-paragraph'
    );
  });

  if (documentFeatures.formatting.blockTypes.blockquote) {
    addShortcut('> ', () => {
      Transforms.wrapNodes(
        editor,
        { type: 'blockquote', children: [] },
        { match: node => node.type === 'paragraph' }
      );
    });
  }

  if (documentFeatures.formatting.blockTypes.code) {
    addShortcut('```', () => {
      Transforms.wrapNodes(
        editor,
        { type: 'code', children: [] },
        { match: node => node.type === 'paragraph' }
      );
    });
  }

  if (documentFeatures.dividers) {
    addShortcut('---', () => {
      Transforms.insertNodes(
        editor,
        { type: 'divider', children: [{ text: '' }] },
        { match: node => node.type === 'paragraph' }
      );
    });
  }

  editor.insertText = text => {
    insertText(text);
    const shortcutsForTrigger = shortcuts[text];
    if (shortcutsForTrigger && editor.selection && Range.isCollapsed(editor.selection)) {
      const { anchor } = editor.selection;
      const block = Editor.above(editor, {
        match: node => Editor.isBlock(editor, node),
      });
      if (!block || (block[0].type !== 'paragraph' && block[0].type !== 'heading')) return;

      const start = Editor.start(editor, block[1]);
      const range = { anchor, focus: start };
      const shortcutText = Editor.string(editor, range);
      const shortcut = shortcutsForTrigger[shortcutText];

      if (!shortcut || (shortcut.type === 'paragraph' && block[0].type !== 'paragraph')) {
        return;
      }
      Transforms.select(editor, range);
      Transforms.delete(editor);
      shortcut.insert();
    }
  };
  return editor;
}
