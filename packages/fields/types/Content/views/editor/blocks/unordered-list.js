import * as React from 'react';
import { ToolbarCheckbox } from '../ToolbarCheckbox';
import { hasAncestorBlock, hasBlock } from '../utils';
import { type as listItemType } from './list-item';
import { type as defaultType } from './paragraph';
import { ListUnorderedIcon } from '@voussoir/icons';

// duplicated logic for now, make some of this functionality happen in the schema instead soon
let handleListButtonClick = (editor, editorState, type) => {
  let isListItem = hasBlock(editorState, listItemType);
  let isOrderedList = hasAncestorBlock(editorState, type);

  let otherListType = type === 'ordered-list' ? 'unordered-list' : 'ordered-list';

  if (isListItem && isOrderedList) {
    editor.setBlocks(defaultType);
    editor.unwrapBlock(type);
  } else if (isListItem) {
    editor.unwrapBlock(otherListType);
    editor.wrapBlock(type);
  } else {
    editor.setBlocks(listItemType).wrapBlock(type);
  }
};

export let type = 'unordered-list';

export function ToolbarElement({ editor, editorState }) {
  return (
    <ToolbarCheckbox
      label="Unordered List"
      id="unordered-list-input"
      icon={ListUnorderedIcon}
      isActive={hasAncestorBlock(editorState, type)}
      onChange={() => {
        handleListButtonClick(editor, editorState, type);
      }}
    />
  );
}

export function renderNode({ attributes, children }) {
  return <ul {...attributes}>{children}</ul>;
}
