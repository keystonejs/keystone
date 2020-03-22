import * as React from 'react';
import { ToolbarButton } from '../toolbar-components';
import { isBlockActive } from '../utils';
import * as listItem from './list-item';
import { type as defaultType } from './paragraph';
import { ListUnorderedIcon } from '@arch-ui/icons';
import { Transforms, Element, Editor, Node as SlateNode } from 'slate';
import { useSlate, ReactEditor } from 'slate-react';

const LIST_TYPES = ['ordered-list', 'unordered-list'];

const unwrapFromList = editor => {
  Transforms.unwrapNodes(editor, { match: n => LIST_TYPES.includes(n.type), split: true });
};

const handleListButtonClick = (editor, type) => {
  const isActive = isBlockActive(editor, type);

  unwrapFromList(editor);

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : 'list-item',
  });

  if (!isActive) {
    Transforms.wrapNodes(editor, { type: type, children: [] });
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
      isActive={isBlockActive(editor, type)}
      onClick={() => handleListButtonClick(editor, type)}
    />
  );
};

export const Node = ({ attributes, children }) => {
  return <ul {...attributes}>{children}</ul>;
};

// TODO: don't duplicate this between the two list types
export const getPlugin = () => editor => {
  const { insertBreak, normalizeNode } = editor;

  editor.insertBreak = () => {
    const [{ text: itemText }] = Editor.leaf(editor, editor.selection);

    // When you press enter in an empty list item, the block type will change to a paragraph.
    if (itemText === '') {
      Transforms.setNodes(editor, { type: defaultType }, { match: n => n.type === listItem.type });
      unwrapFromList(editor);
    } else {
      insertBreak();
    }
  };

  editor.normalizeNode = entry => {
    const [node, path] = entry;

    if (Element.isElement(node) && node.type === type) {
      for (const [child] of SlateNode.children(editor, path)) {
        // TODO: does this work?
        if (Element.isElement(child) && child.type !== listItem.type) {
          unwrapFromList(editor);
          return;
        }
      }
    }

    normalizeNode(entry);
  };

  return editor;
};
