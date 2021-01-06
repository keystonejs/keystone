import React, { ButtonHTMLAttributes } from 'react';
import { Transforms, Range, Editor } from 'slate';
import { ReactEditor } from 'slate-react';

import { MinusIcon } from '@keystone-ui/icons/icons/MinusIcon';
import { Tooltip } from '@keystone-ui/tooltip';

import { ToolbarButton } from './primitives';
import { useStaticEditor } from './utils';

const DividerButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const editor = useStaticEditor();
  return (
    <Tooltip content="Divider" weight="subtle">
      {attrs => (
        <ToolbarButton
          onMouseDown={event => {
            event.preventDefault();
            Transforms.insertNodes(
              editor,
              { type: 'divider', children: [{ text: '' }] },
              { match: node => node.type === 'paragraph' }
            );
          }}
          {...attrs}
          {...props}
        >
          <MinusIcon size="small" />
        </ToolbarButton>
      )}
    </Tooltip>
  );
};

export const dividerButton = <DividerButton />;

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
