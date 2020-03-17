import * as React from 'react';
import { ToolbarButton } from '../toolbar-components';
import { isBlockActive } from '../utils';
import * as listItem from './list-item';
import { type as defaultType } from './paragraph';
import { ListOrderedIcon } from '@arch-ui/icons';
import { Transforms, Element, Node as SlateNode } from 'slate';
import { useSlate, ReactEditor } from 'slate-react';

const LIST_TYPES = ['ordered-list', 'unordered-list'];

const handleListButtonClick = (editor, type) => {
  const isActive = isBlockActive(editor, type);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : 'list-item',
  });

  if (!isActive) {
    Transforms.wrapNodes(editor, { type: type, children: [] });
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
      onClick={() => handleListButtonClick(editor, type)}
    />
  );
};

export const Node = ({ attributes, children }) => {
  return <ol {...attributes}>{children}</ol>;
};

export const getPlugin = () => editor => {
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

  // make it so when you press enter in an empty list item,
  // the block type will change to a paragraph
  // FIXME: ^^
  editor.normalizeNode = entry => {
    const [node, path] = entry;

    if (Element.isElement(node) && node.type === type) {
      for (const [child, childPath] of SlateNode.children(editor, path)) {
        if (child.type !== listItem.type) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }

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
};
