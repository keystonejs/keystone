/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { RenderElementProps } from 'slate-react';

import { Editor, Transforms, Range, Point, Path, Node, Element, Text } from 'slate';

export const HeadingElement = ({
  attributes,
  children,
  element,
}: RenderElementProps & { element: { type: 'heading' } }) => {
  const Tag = `h${element.level}` as const;
  return (
    <Tag {...attributes} css={{ textAlign: element.textAlign }}>
      {children}
    </Tag>
  );
};

export function withHeading<T extends Editor>(editor: T): T {
  const { insertBreak } = editor;
  editor.insertBreak = () => {
    insertBreak();

    const entry = Editor.above(editor, {
      match: n => n.type === 'heading',
    });
    if (!entry || !editor.selection || !Range.isCollapsed(editor.selection)) return;
    const path = entry[1];

    if (
      // we want to unwrap the heading when the user inserted a break at the end of the heading
      // when the user inserts a break at the end of a heading, the new heading
      // that we want to unwrap will be empty so the end will be equal to the selection
      Point.equals(Editor.end(editor, path), editor.selection.anchor)
    ) {
      Transforms.unwrapNodes(editor, {
        at: path,
      });
      return;
    }
    // we also want to unwrap the _previous_ heading when the user inserted a break
    // at the start of the heading, essentially just inserting an empty paragraph above the heading
    if (!Path.hasPrevious(path)) return;
    const previousPath = Path.previous(path);
    const previousNode = Node.get(editor, previousPath) as Element;
    if (
      previousNode.type === 'heading' &&
      previousNode.children.length === 1 &&
      Text.isText(previousNode.children[0]) &&
      previousNode.children[0].text === ''
    ) {
      Transforms.unwrapNodes(editor, {
        at: previousPath,
      });
    }
  };
  return editor;
}
