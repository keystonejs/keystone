import * as React from 'react';
import { ToolbarButton } from '../toolbar-components';
import { hasAncestorBlock, hasBlock } from '../utils';
import * as listItem from './list-item';
import { type as defaultType } from './paragraph';
import { ListUnorderedIcon } from '@arch-ui/icons';

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

export let type = 'unordered-list';

export function ToolbarElement({ editor, editorState }) {
  return (
    <ToolbarButton
      isActive={hasAncestorBlock(editorState, type)}
      onClick={() => {
        handleListButtonClick(editor, editorState, type);
      }}
    >
      <ListUnorderedIcon title="Unordered List" />
    </ToolbarButton>
  );
}

export let plugins = [
  {
    onKeyDown(event, editor, next) {
      // make it so when you press enter in an empty list item,
      // the block type will change to a paragraph
      if (
        event.keyCode === 13 &&
        hasAncestorBlock(editor.value, type) &&
        editor.value.focusText.text === ''
      ) {
        editor.setBlocks(defaultType).unwrapBlock(type);
        return;
      }
      next();
    },
  },
];

export function Node({ attributes, children }) {
  return <ul {...attributes}>{children}</ul>;
}

export const schema = {
  nodes: [
    {
      match: { type: listItem.type },
      min: 0,
    },
  ],
  normalize(editor, error) {
    switch (error.code) {
      case 'child_type_invalid': {
        editor.unwrapBlockByKey(error.node.key, type);
        return;
      }
    }
  },
};

export let dependencies = [listItem];
