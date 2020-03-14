import * as React from 'react';
import { ToolbarButton } from '../toolbar-components';
import { hasAncestorBlock, isBlockActive } from '../utils';
import * as listItem from './list-item';
import { type as defaultType } from './paragraph';
import { ListUnorderedIcon } from '@arch-ui/icons';
import { Transforms } from 'slate';
import { useSlate, ReactEditor } from 'slate-react';

const LIST_TYPES = ['ordered-list', 'unordered-list'];

const handleListButtonClick = (editor, type) => {
  const isActive = isBlockActive(editor, type)

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true,
  })

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : 'list-item',
  })

  if (!isActive) {
    Transforms.wrapNodes(editor, { type: type, children: [] })
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
      onClick={() => handleListButtonClick(editor, type)}
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