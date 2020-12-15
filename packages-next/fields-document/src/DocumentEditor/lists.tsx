/** @jsx jsx */

import { ReactNode, forwardRef } from 'react';
import { Editor, Element, Node, NodeEntry, Path, Transforms, Range } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { jsx } from '@keystone-ui/core';

import { DocumentFeatures } from '../views';

import { getMaybeMarkdownShortcutText, isBlockActive, moveChildren } from './utils';
import { ToolbarButton } from './primitives';

export const isListType = (type: string) => type === 'ordered-list' || type === 'unordered-list';

export const toggleList = (editor: ReactEditor, format: 'ordered-list' | 'unordered-list') => {
  const isActive = isBlockActive(editor, format);
  Editor.withoutNormalizing(editor, () => {
    Transforms.unwrapNodes(editor, {
      match: n => isListType(n.type as string),
      split: true,
    });
    if (!isActive) {
      Transforms.wrapNodes(editor, { type: format, children: [] });
    }
  });
};

function getAncestorList(
  editor: ReactEditor
):
  | { isInside: false }
  | { isInside: true; list: NodeEntry<Element>; listItem: NodeEntry<Element> } {
  if (editor.selection) {
    const listItem = Editor.above(editor, {
      match: node => node.type === 'list-item',
    });
    const list = Editor.above(editor, {
      match: node => isListType(node.type as string),
    });
    if (listItem && list) {
      return {
        isInside: true,
        listItem,
        list,
      };
    }
  }
  return { isInside: false };
}

export function withList(listTypes: DocumentFeatures['listTypes'], editor: ReactEditor) {
  const { insertBreak, normalizeNode, insertText, deleteBackward } = editor;
  editor.deleteBackward = unit => {
    if (editor.selection) {
      const ancestorList = getAncestorList(editor);
      if (
        ancestorList.isInside &&
        Range.isCollapsed(editor.selection) &&
        Editor.isStart(editor, editor.selection.anchor, ancestorList.list[1])
      ) {
        Transforms.unwrapNodes(editor, { at: ancestorList.list[1] });
        return;
      }
    }
    deleteBackward(unit);
  };
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

  if (listTypes.ordered || listTypes.unordered) {
    editor.insertText = text => {
      const [shortcutText, deleteShortcutText] = getMaybeMarkdownShortcutText(text, editor);
      const listType =
        shortcutText === '1.' && listTypes.ordered
          ? 'ordered-list'
          : shortcutText === '-' && listTypes.unordered
          ? 'unordered-list'
          : undefined;
      if (listType) {
        Editor.withoutNormalizing(editor, () => {
          deleteShortcutText();
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

      insertText(text);
    };
  }
  editor.normalizeNode = entry => {
    const [node, path] = entry;
    if (Element.isElement(node) || Editor.isEditor(node)) {
      for (const [childNode, childPath] of Node.children(editor, path)) {
        // merge sibling lists
        if (
          isListType(childNode.type as string) &&
          node.children[childPath[childPath.length - 1] + 1]?.type === childNode.type
        ) {
          const siblingNodePath = Path.next(childPath);
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

export const ListButton = forwardRef<
  HTMLButtonElement,
  {
    type: 'ordered-list' | 'unordered-list';
    children: ReactNode;
  }
>(({ type, ...props }, ref) => {
  const editor = useSlate();
  return (
    <ToolbarButton
      ref={ref}
      isSelected={isBlockActive(editor, type)}
      onMouseDown={event => {
        event.preventDefault();
        toggleList(editor, type);
      }}
      {...props}
    />
  );
});
