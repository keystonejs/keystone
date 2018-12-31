import * as React from 'react';
import { hasBlock } from '../utils';
import { defaultType } from '../constants';
import { ToolbarButton } from '../ToolbarButton';

export let type = 'heading';

export function ToolbarElement({ editor, editorState }) {
  return (
    <ToolbarButton
      isActive={hasBlock(editorState, type)}
      onClick={() => {
        if (hasBlock(editorState, type)) {
          editor.setBlocks({ type: defaultType });
        } else {
          editor.setBlocks({ type: type });
        }
      }}
    >
      heading
    </ToolbarButton>
  );
}
export function renderNode({ attributes, children }) {
  return <h2 {...attributes}>{children}</h2>;
}
