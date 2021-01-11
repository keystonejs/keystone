import React, { ComponentProps, useMemo } from 'react';
import { Transforms } from 'slate';
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

export function withDivider(editor: ReactEditor) {
  const { isVoid } = editor;
  editor.isVoid = node => {
    return node.type === 'divider' || isVoid(node);
  };
  return editor;
}
