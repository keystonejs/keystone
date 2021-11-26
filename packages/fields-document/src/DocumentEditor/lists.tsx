/** @jsxRuntime classic */
/** @jsx jsx */

import { ReactNode, forwardRef, useMemo } from 'react';
import { Editor, Element, Node, Path, Transforms, Range } from 'slate';
import { jsx } from '@keystone-ui/core';

import { isElementActive, moveChildren, nodeTypeMatcher } from './utils';
import { ToolbarButton } from './primitives';
import { getListTypeAbove, useToolbarState } from './toolbar-state';

export const isListType = (type: string | undefined) =>
  type === 'ordered-list' || type === 'unordered-list';

export const isListNode = (
  node: Node
): node is Element & { type: 'ordered-list' | 'unordered-list' } => isListType(node.type);

export const toggleList = (editor: Editor, format: 'ordered-list' | 'unordered-list') => {
  const listAbove = getListTypeAbove(editor);
  const isActive =
    isElementActive(editor, format) && (listAbove === 'none' || listAbove === format);
  Editor.withoutNormalizing(editor, () => {
    Transforms.unwrapNodes(editor, {
      match: isListNode,
      split: true,
      mode: isActive ? 'all' : 'lowest',
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

function getAncestorList(editor: Editor) {
  if (editor.selection) {
    const listItem = Editor.above(editor, {
      match: nodeTypeMatcher('list-item'),
    });
    const list = Editor.above(editor, {
      match: isListNode,
    });
    if (listItem && list) {
      return {
        isInside: true,
        listItem,
        list,
      } as const;
    }
  }
  return { isInside: false } as const;
}

export function withList(editor: Editor): Editor {
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
          match: isListNode,
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
        match: isListNode,
        split: true,
      });
      return;
    }

    insertBreak();
  };

  editor.normalizeNode = entry => {
    const [node, path] = entry;
    if (Element.isElement(node) || Editor.isEditor(node)) {
      const isElementBeingNormalizedAList = isListNode(node);
      for (const [childNode, childPath] of Node.children(editor, path)) {
        const index = childPath[childPath.length - 1];
        // merge sibling lists
        if (isListNode(childNode)) {
          if (node.children[childPath[childPath.length - 1] + 1]?.type === childNode.type) {
            const siblingNodePath = Path.next(childPath);
            moveChildren(editor, siblingNodePath, [...childPath, childNode.children.length]);
            Transforms.removeNodes(editor, { at: siblingNodePath });
            return;
          }
          if (isElementBeingNormalizedAList) {
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
  }, [props, ref, isDisabled, isSelected, editor]);
});

export function nestList(editor: Editor) {
  const block = Editor.above(editor, {
    match: n => Editor.isBlock(editor, n),
  });

  if (!block || block[0].type !== 'list-item-content') {
    return false;
  }
  const listItemPath = Path.parent(block[1]);
  // we're the first item in the list therefore we can't nest
  if (listItemPath[listItemPath.length - 1] === 0) {
    return false;
  }
  const previousListItemPath = Path.previous(listItemPath);
  const previousListItemNode = Node.get(editor, previousListItemPath) as Element;
  if (previousListItemNode.children.length !== 1) {
    // there's a list nested inside our previous sibling list item so move there
    Transforms.moveNodes(editor, {
      at: listItemPath,
      to: [
        ...previousListItemPath,
        previousListItemNode.children.length - 1,
        (previousListItemNode.children[previousListItemNode.children.length - 1] as any).children
          .length,
      ],
    });
    return true;
  }
  const type = Editor.parent(editor, Path.parent(block[1]))[0].type as
    | 'ordered-list'
    | 'unordered-list';
  Editor.withoutNormalizing(editor, () => {
    Transforms.wrapNodes(editor, { type, children: [] }, { at: listItemPath });
    Transforms.moveNodes(editor, {
      to: [...previousListItemPath, previousListItemNode.children.length],
      at: listItemPath,
    });
  });
  return true;
}

export function unnestList(editor: Editor) {
  const block = Editor.above(editor, {
    match: n => Editor.isBlock(editor, n),
  });

  if (block && block[0].type === 'list-item-content') {
    Transforms.unwrapNodes(editor, {
      match: isListNode,
      split: true,
    });
    return true;
  }
  return false;
}
