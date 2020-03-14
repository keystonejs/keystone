import * as React from 'react';
import { ToolbarButton } from '../toolbar-components';
import { hasAncestorBlock, hasBlock } from '../utils';
import * as listItem from './list-item';
import { type as defaultType } from './paragraph';
import { ListUnorderedIcon } from '@arch-ui/icons';
import { useSlate, ReactEditor } from 'slate-react';

// duplicated logic for now, make some of this functionality happen in the schema instead soon
const handleListButtonClick = (editor, editorState, type) => {
  let isListItem = hasBlock(editor, listItem.type);
  //let isOrderedList = hasAncestorBlock(editorState, type);
  let isOrderedList = false;

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

  ReactEditor.focus(editor);
};

export const type = 'unordered-list';

export const ToolbarElement = () => {
  const editor = useSlate();

  return (
    <ToolbarButton
      label="Unordered List"
      icon={<ListUnorderedIcon />}
      isActive={hasAncestorBlock(editor, type)}
      onClick={() => {
        handleListButtonClick(editor, null, type);
      }}
    />
  );
}

export const getPlugins = () => [
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

export const Node = ({ attributes, children }) => {
  return <ul {...attributes}>{children}</ul>;
}

export const getSchema = () => ({
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
});

export const getPluginsNew = () => [
  editor => {
    const { normalizeNode } = editor;

    editor.normalizeNode = entry => {
      normalizeNode(entry);
    }

    return editor;
  }
]