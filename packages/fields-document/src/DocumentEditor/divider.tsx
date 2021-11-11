import React, { ComponentProps, Fragment, useMemo } from 'react';
import { Editor } from 'slate';

import { MinusIcon } from '@keystone-ui/icons/icons/MinusIcon';
import { Tooltip } from '@keystone-ui/tooltip';

import { KeyboardInTooltip, ToolbarButton } from './primitives';
import { useToolbarState } from './toolbar-state';
import { insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading } from './utils';

const minusIcon = <MinusIcon size="small" />;

export function insertDivider(editor: Editor) {
  insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, {
    type: 'divider',
    children: [{ text: '' }],
  });
  Editor.insertNode(editor, { type: 'paragraph', children: [{ text: '' }] });
}

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
          insertDivider(editor);
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
  <Tooltip
    content={
      <Fragment>
        Divider<KeyboardInTooltip>---</KeyboardInTooltip>
      </Fragment>
    }
    weight="subtle"
  >
    {attrs => <DividerButton attrs={attrs} />}
  </Tooltip>
);

export function withDivider(editor: Editor): Editor {
  const { isVoid } = editor;
  editor.isVoid = node => {
    return node.type === 'divider' || isVoid(node);
  };
  return editor;
}
