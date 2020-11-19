/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { ReactEditor, useSlate } from 'slate-react';
import { Editor, Element, Node, Path, Range, Transforms } from 'slate';
import { ReactNode } from 'react';

import { isBlockActive, moveChildren, onlyContainerNodeInCurrentSelection } from './utils';
import { Button } from './components';

export const isListType = (type: string) => type === 'ordered-list' || type === 'unordered-list';

const toggleList = (editor: ReactEditor, format: string) => {
  const isActive = isBlockActive(editor, format);
  if (isActive) {
    Transforms.unwrapNodes(editor, {
      match: n => isListType(n.type as string),
      split: true,
    });
  } else {
    const oppositeListType = format === 'ordered-list' ? 'unordered-list' : 'ordered-list';
    if (isBlockActive(editor, oppositeListType)) {
      Transforms.setNodes(
        editor,
        { type: format },
        { match: node => isListType(node.type as string), split: true }
      );
    } else {
      Transforms.wrapNodes(editor, { type: format, children: [] });
    }
  }
};

export function withList(editor: ReactEditor) {
  const { insertBreak, normalizeNode, insertText } = editor;
  editor.insertBreak = () => {
    const [listItem] = Editor.nodes(editor, {
      match: node => node.type === 'list-item',
    });
    if (listItem && Node.string(listItem[0]) === '') {
      Transforms.unwrapNodes(editor, {
        match: node => isListType(node.type as string),
        split: true,
      });
      return;
    }

    insertBreak();
  };

  editor.insertText = text => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range);
      const listType =
        beforeText === '1.' ? 'ordered-list' : beforeText === '-' ? 'unordered-list' : undefined;
      if (listType) {
        Editor.withoutNormalizing(editor, () => {
          Transforms.select(editor, range);
          Transforms.delete(editor);
          Transforms.setNodes(
            editor,
            { type: 'list-item' },
            { match: n => Editor.isBlock(editor, n) }
          );
          Transforms.wrapNodes(
            editor,
            { type: listType, children: [] },
            { match: n => n.type === 'list-item' }
          );
        });

        return;
      }
    }

    insertText(text);
  };
  editor.normalizeNode = entry => {
    const [node, path] = entry;
    if (Element.isElement(node) || Editor.isEditor(node)) {
      const isList = isListType(node.type as string);
      for (const [childNode, childPath] of Node.children(editor, path)) {
        if (isList) {
          if (childNode.type !== 'list-item' && !isListType(childNode.type as string)) {
            Transforms.setNodes(editor, { type: 'list-item' }, { at: childPath });
            return;
          }
        } else if (childNode.type === 'list-item') {
          Transforms.setNodes(editor, { type: 'paragraph' }, { at: childPath });
          return;
        }
        if (
          node.type === 'list-item' &&
          Element.isElement(childNode) &&
          !editor.isInline(childNode)
        ) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }

        if (
          isListType(childNode.type as string) &&
          node.children[childPath[childPath.length - 1] + 1]?.type === childNode.type
        ) {
          const [, siblingNodePath] = Editor.node(editor, Path.next(childPath));
          moveChildren(editor, siblingNodePath, [
            ...childPath,
            (childNode.children as Element).length as number,
          ]);
          Transforms.removeNodes(editor, { at: siblingNodePath });
          return;
        }
      }
    }
    normalizeNode(entry);
  };
  return editor;
}

export const ListButton = ({
  type,
  children,
}: {
  type: 'ordered-list' | 'unordered-list';
  children: ReactNode;
}) => {
  const editor = useSlate();
  return (
    <Button
      isDisabled={
        !onlyContainerNodeInCurrentSelection(editor) &&
        !(isBlockActive(editor, 'ordered-list') || isBlockActive(editor, 'unordered-list'))
      }
      isSelected={isBlockActive(editor, type)}
      onMouseDown={event => {
        event.preventDefault();
        toggleList(editor, type);
      }}
    >
      {children}
    </Button>
  );
};
