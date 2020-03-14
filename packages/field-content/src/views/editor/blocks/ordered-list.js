import * as React from 'react';
import { ToolbarButton } from '../toolbar-components';
import { hasAncestorBlock, hasBlock, isBlockActive } from '../utils';
import * as listItem from './list-item';
import { type as defaultType } from './paragraph';
import { ListOrderedIcon } from '@arch-ui/icons';
import { Transforms, Element, Editor, Node as SlateNode, Text } from 'slate';
import { useSlate, ReactEditor } from 'slate-react';

// duplicated logic for now, make some of this functionality happen in the schema instead soon
const handleListButtonClick = (editor, editorState, type) => {
  const isListItem = hasBlock(editor, listItem.type);
  const isOrderedList = hasAncestorBlock(editor, type);

  const otherListType = type === 'ordered-list' ? 'unordered-list' : 'ordered-list';

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

export const type = 'ordered-list';

export const ToolbarElement = () => {
  const editor = useSlate();

  return (
    <ToolbarButton
      label="Ordered List"
      icon={<ListOrderedIcon />}
      isActive={isBlockActive(editor, type)}
      onClick={() => {
        handleListButtonClick(editor, null, type);
      }}
    />
  );
}

export const Node = ({ attributes, children }) => {
  return <ol {...attributes}>{children}</ol>;
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
    const { insertBreak, normalizeNode } = editor;

    editor.insertBreak = () => {
      // When you press enter in an empty list item, the block type will change to a paragraph.
      Transforms.setNodes(
        editor,
        { type: defaultType },
        {
          match: n => n.type === listItem.type && SlateNode.child(n, 0).text === '',
        }
      );

      insertBreak();
    };

    editor.normalizeNode = entry => {
      const [node, path] = entry;

      if (Element.isElement(node) && node.type === type) {
        for (const [child, childPath] of SlateNode.children(editor, path)) {
          if (Element.isElement(child)) {
            return;
            if (child.type === 'MAGIC_VALUE') {
              Transforms.setNodes(editor, { type: defaultType }, { at: childPath });
              Transforms.moveNodes(editor, { at: childPath, to: path });
              return;
            }

            if (child.type !== listItem.type) {
              Transforms.removeNodes(editor, { at: childPath });
              return;
            }
          }
        }
      }

      normalizeNode(entry);
    };

    return editor;
  },
];
