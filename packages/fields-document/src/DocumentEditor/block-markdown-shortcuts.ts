import { Editor, Transforms, Range } from 'slate';
import { DocumentFeatures } from '../views';
import { ComponentBlock } from './component-blocks/api';
import { insertDivider } from './divider';
import { DocumentFeaturesForNormalization } from './document-features-normalization';
import { getAncestorComponentChildFieldDocumentFeatures } from './toolbar-state';

export function withBlockMarkdownShortcuts(
  documentFeatures: DocumentFeatures,
  componentBlocks: Record<string, ComponentBlock>,
  editor: Editor
): Editor {
  const { insertText } = editor;
  const shortcuts: Record<
    string,
    Record<
      string,
      {
        insert: () => void;
        type: 'paragraph' | 'heading-or-paragraph';
        shouldBeEnabledInComponentBlock: (
          locationDocumentFeatures: DocumentFeaturesForNormalization
        ) => boolean;
      }
    >
  > = Object.create(null);
  const editorDocumentFeaturesForNormalizationToCheck: DocumentFeaturesForNormalization = {
    ...documentFeatures,
    relationships: true,
  };
  let addShortcut = (
    text: string,
    insert: () => void,
    shouldBeEnabledInComponentBlock: (
      locationDocumentFeatures: DocumentFeaturesForNormalization
    ) => boolean,
    type: 'paragraph' | 'heading-or-paragraph' = 'paragraph'
  ) => {
    if (!shouldBeEnabledInComponentBlock(editorDocumentFeaturesForNormalizationToCheck)) return;
    const trigger = text[text.length - 1];
    if (!shortcuts[trigger]) {
      shortcuts[trigger] = Object.create(null);
    }
    shortcuts[trigger][text] = {
      insert,
      type,
      shouldBeEnabledInComponentBlock,
    };
  };
  addShortcut(
    '1. ',
    () => {
      Transforms.wrapNodes(
        editor,
        { type: 'ordered-list', children: [] },
        { match: n => Editor.isBlock(editor, n) }
      );
    },
    features => features.formatting.listTypes.ordered
  );

  addShortcut(
    '- ',
    () => {
      Transforms.wrapNodes(
        editor,
        { type: 'unordered-list', children: [] },
        { match: n => Editor.isBlock(editor, n) }
      );
    },
    features => features.formatting.listTypes.unordered
  );
  addShortcut(
    '* ',
    () => {
      Transforms.wrapNodes(
        editor,
        { type: 'unordered-list', children: [] },
        { match: n => Editor.isBlock(editor, n) }
      );
    },
    features => features.formatting.listTypes.unordered
  );

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
      features => features.formatting.headingLevels.includes(level),
      'heading-or-paragraph'
    );
  });

  addShortcut(
    '> ',
    () => {
      Transforms.wrapNodes(
        editor,
        { type: 'blockquote', children: [] },
        { match: node => node.type === 'paragraph' }
      );
    },
    features => features.formatting.blockTypes.blockquote
  );

  addShortcut(
    '```',
    () => {
      Transforms.wrapNodes(
        editor,
        { type: 'code', children: [] },
        { match: node => node.type === 'paragraph' }
      );
    },
    features => features.formatting.blockTypes.code
  );

  addShortcut(
    '---',
    () => {
      insertDivider(editor);
    },
    features => features.dividers
  );

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
      const locationDocumentFeatures = getAncestorComponentChildFieldDocumentFeatures(
        editor,
        documentFeatures,
        componentBlocks
      );
      if (
        locationDocumentFeatures &&
        (locationDocumentFeatures.kind === 'inline' ||
          !shortcut.shouldBeEnabledInComponentBlock(locationDocumentFeatures.documentFeatures))
      ) {
        return;
      }
      // so that this starts a new undo group
      editor.history.undos.push([]);
      Transforms.select(editor, range);
      Transforms.delete(editor);
      shortcut.insert();
    }
  };
  return editor;
}
