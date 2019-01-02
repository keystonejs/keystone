import * as React from 'react';
import { hasBlock } from '../utils';
import { type as defaultType } from './paragraph';
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

export let plugins = [
  {
    onKeyDown(event, editor, next) {
      // make it so when you press enter after typing a heading,
      // the block type will change to a paragraph
      if (event.keyCode === 13 && editor.value.blocks.every(block => block.type === type)) {
        editor.splitBlock().setBlocks(defaultType);
        return;
      }
      next();
    },
  },
];
