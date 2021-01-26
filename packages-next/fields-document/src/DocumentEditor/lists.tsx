/** @jsx jsx */

import { ReactNode, forwardRef, useMemo } from 'react';
import { Editor, Element, Node, NodeEntry, Path, Transforms, Range } from 'slate';
import { jsx } from '@keystone-ui/core';

import { isBlockActive, moveChildren } from './utils';
import { ToolbarButton } from './primitives';
import { useToolbarState } from './toolbar-state';

export const isListType = (type: string) => type === 'ordered-list' || type === 'unordered-list';

export const toggleList = (editor: Editor, format: 'ordered-list' | 'unordered-list') => {
  const isActive = isBlockActive(editor, format);
  Editor.withoutNormalizing(editor, () => {
    Transforms.unwrapNodes(editor, {
      match: n => isListType(n.type as string),
      split: true,
      mode: isActive ? 'lowest' : 'all',
    });
    if (!isActive) {
      Transforms.wrapNodes(
        editor,
        { type: format, children: [] },
        { match: x => x.type !== 'list-item-content' && Editor.isBlock(editor, x) }
      );
    }
  });
};

function getAncestorList(
  editor: Editor
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

export function withList<T extends Editor>(editor: T): T {
  const { insertBreak, normalizeNode, deleteBackward } = editor;
  editor.deleteBackward = unit => {
    if (editor.selection) {
      const ancestorList = getAncestorList(editor);
      if (
        ancestorList.isInside &&
        Range.isCollapsed(editor.selection) &&
        Editor.isStart(editor, editor.selection.anchor, ancestorList.list[1])
      ) {
        Transforms.unwrapNodes(editor, {
          match: node => isListType(node.type as string),
          split: true,
        });
        return;
      }
    }
    deleteBackward(unit);
  };
  editor.insertBreak = () => {
    const [listItem] = Editor.nodes(editor, {
      match: node => node.type === 'list-item',
      mode: 'lowest',
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

  editor.normalizeNode = entry => {
    const [node, path] = entry;
    if (Element.isElement(node) || Editor.isEditor(node)) {
      const isElementBeingNormalizedAList = isListType(node.type as string);
      for (const [childNode, childPath] of Node.children(editor, path)) {
        const index = childPath[childPath.length - 1];
        // merge sibling lists
        const isChildElementAList = isListType(childNode.type as string);
        if (
          isChildElementAList &&
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
        if (isElementBeingNormalizedAList && isChildElementAList) {
          const previousChild = node.children[index - 1];
          if (Element.isElement(previousChild)) {
            Transforms.moveNodes(editor, {
              at: childPath,
              to: [...Path.previous(childPath), previousChild.children.length - 1],
            });
          } else {
            Transforms.unwrapNodes(editor, { at: childPath });
          }
          return;
        }
        if (
          node.type === 'list-item' &&
          childNode.type !== 'list-item-content' &&
          index === 0 &&
          Editor.isBlock(editor, childNode)
        ) {
          if (path[path.length - 1] !== 0) {
            const previousChild = Node.get(editor, Path.previous(path));

            if (Element.isElement(previousChild)) {
              Transforms.moveNodes(editor, {
                at: path,
                to: [...Path.previous(path), previousChild.children.length],
              });
              return;
            }
          }
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }
        if (node.type === 'list-item' && childNode.type === 'list-item-content' && index !== 0) {
          Transforms.splitNodes(editor, { at: childPath });
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
>(function ListButton(props, ref) {
  const {
    editor,
    lists: {
      [props.type === 'ordered-list' ? 'ordered' : 'unordered']: { isDisabled, isSelected },
    },
  } = useToolbarState();

  return useMemo(() => {
    const { type, ...restProps } = props;
    return (
      <ToolbarButton
        ref={ref}
        isDisabled={isDisabled}
        isSelected={isSelected}
        onMouseDown={event => {
          event.preventDefault();
          toggleList(editor, type);
        }}
        {...restProps}
      />
    );
  }, [props, ref, isDisabled, isSelected]);
});

export function nestList(editor: Editor) {
  const block = Editor.above(editor, {
    match: n => Editor.isBlock(editor, n),
  });

  if (block && block[0].type === 'list-item-content') {
    const type = Editor.parent(editor, Path.parent(block[1]))[0].type as string;
    Transforms.wrapNodes(editor, {
      type,
      children: [],
    });
    return true;
  }
  return false;
}

export function unnestList(editor: Editor) {
  const block = Editor.above(editor, {
    match: n => Editor.isBlock(editor, n),
  });

  if (block && block[0].type === 'list-item-content') {
    Transforms.unwrapNodes(editor, {
      match: node => isListType(node.type as string),
      split: true,
    });
    return true;
  }
  return false;
}
