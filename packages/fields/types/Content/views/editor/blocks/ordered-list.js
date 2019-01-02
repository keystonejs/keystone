import * as React from 'react';
import { ToolbarCheckbox } from '../ToolbarCheckbox';
import { hasAncestorBlock, hasBlock } from '../utils';
import * as listItem from './list-item';
import { type as defaultType } from './paragraph';
import { ListOrderedIcon } from '@voussoir/icons';

// duplicated logic for now, make some of this functionality happen in the schema instead soon
let handleListButtonClick = (editor, editorState, type) => {
  let isListItem = hasBlock(editorState, listItem.type);
  let isOrderedList = hasAncestorBlock(editorState, type);

  let otherListType = type === 'ordered-list' ? 'unordered-list' : 'ordered-list';

  if (isListItem && isOrderedList) {
    editor.setBlocks(defaultType);
    editor.unwrapBlock(type);
  } else if (isListItem) {
    editor.unwrapBlock(otherListType);
    editor.wrapBlock(type);
  } else {
    editor.setBlocks(listItem.type).wrapBlock(type);
  }
};

export let type = 'ordered-list';

export function ToolbarElement({ editor, editorState }) {
  return (
    <ToolbarCheckbox
      label="Ordered List"
      id="ordered-list-input"
      icon={ListOrderedIcon}
      isActive={hasAncestorBlock(editorState, type)}
      onChange={() => {
        handleListButtonClick(editor, editorState, type);
      }}
    />
  );
}

export function renderNode({ attributes, children }) {
  return <ol {...attributes}>{children}</ol>;
}

export let dependencies = [listItem];
