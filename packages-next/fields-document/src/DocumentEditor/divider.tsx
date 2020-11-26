import { Button } from './components';
import { MinusIcon } from '@keystone-ui/icons/icons/MinusIcon';
import { Tooltip } from '@keystone-ui/tooltip';
import React, { ButtonHTMLAttributes } from 'react';
import { Transforms, Range, Editor } from 'slate';
import { ReactEditor, useEditor } from 'slate-react';

export const dividerButton = (
  <Tooltip content="Divider" weight="subtle">
    {attrs => <DividerButton {...attrs} />}
  </Tooltip>
);

const DividerButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  // useEditor does not update when the value/selection changes.
  // that's fine for what it's being used for here
  // because we're just inserting things on events, not reading things in render
  const editor = useEditor();
  return (
    <Button
      onMouseDown={event => {
        event.preventDefault();
        Transforms.insertNodes(
          editor,
          { type: 'divider', children: [{ text: '' }] },
          { match: node => node.type === 'paragraph' }
        );
      }}
      {...props}
    >
      <MinusIcon size="small" />
    </Button>
  );
};

export function withDivider(enabled: boolean, editor: ReactEditor) {
  const { isVoid, insertText } = editor;
  editor.isVoid = node => {
    return node.type === 'divider' || isVoid(node);
  };
  if (enabled) {
    // this is slightly different to the usages of getMaybeMarkdownShortcutText because the insertion happens on - rather than a space
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
