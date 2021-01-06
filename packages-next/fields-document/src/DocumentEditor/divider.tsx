import React, { ComponentProps, useMemo } from 'react';
import { Transforms, Range, Editor } from 'slate';
import { ReactEditor } from 'slate-react';

import { MinusIcon } from '@keystone-ui/icons/icons/MinusIcon';
import { Tooltip } from '@keystone-ui/tooltip';

import { ToolbarButton } from './primitives';
import { useToolbarState } from './toolbar-state';

const minusIcon = <MinusIcon size="small" />;

const DividerButton = ({
  attrs,
}: {
  attrs: Parameters<ComponentProps<typeof Tooltip>['children']>[0];
}) => {
  const {
    editor,
    dividers: { isDisabled },
  } = useToolbarState();
  return useMemo(
    () => (
      <ToolbarButton
        isDisabled={isDisabled}
        onMouseDown={event => {
          event.preventDefault();
          Transforms.insertNodes(
            editor,
            { type: 'divider', children: [{ text: '' }] },
            { match: node => node.type === 'paragraph' }
          );
        }}
        {...attrs}
      >
        {minusIcon}
      </ToolbarButton>
    ),
    [editor, isDisabled, attrs]
  );
};

export const dividerButton = (
  <Tooltip content="Divider" weight="subtle">
    {attrs => <DividerButton attrs={attrs} />}
  </Tooltip>
);

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
