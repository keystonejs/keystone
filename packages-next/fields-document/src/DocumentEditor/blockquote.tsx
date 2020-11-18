/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { Editor, Node, Path, Range, Transforms } from 'slate';
import { ReactEditor, RenderElementProps } from 'slate-react';

export const insertBlockquote = (editor: ReactEditor) => {
  Transforms.wrapNodes(
    editor,
    {
      type: 'blockquote',
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    },
    { match: node => node.type === 'paragraph' }
  );
};

function getDirectBlockquoteParentFromSelection(editor: ReactEditor) {
  if (!editor.selection) return { isInside: false } as const;
  const [, parentPath] = Editor.parent(editor, editor.selection);
  const [maybeBlockquoteParent, maybeBlockquoteParentPath] = Editor.parent(editor, parentPath);
  const isBlockquote = maybeBlockquoteParent.type === 'blockquote';
  return isBlockquote
    ? ({ isInside: true, path: maybeBlockquoteParentPath } as const)
    : ({ isInside: false } as const);
}

export const withBlockquote = (editor: ReactEditor) => {
  const { insertBreak, deleteBackward } = editor;
  editor.deleteBackward = unit => {
    if (editor.selection) {
      const parentBlockquote = getDirectBlockquoteParentFromSelection(editor);
      if (
        parentBlockquote.isInside &&
        Range.isCollapsed(editor.selection) &&
        // the selection is at the start of the paragraph
        editor.selection.anchor.offset === 0 &&
        // it's the first paragraph in the panel
        editor.selection.anchor.path[editor.selection.anchor.path.length - 2] === 0
      ) {
        Transforms.unwrapNodes(editor, { at: parentBlockquote.path });
        return;
      }
    }
    deleteBackward(unit);
  };
  editor.insertBreak = () => {
    const panel = getDirectBlockquoteParentFromSelection(editor);
    if (editor.selection && panel.isInside) {
      const [node, nodePath] = Editor.node(editor, editor.selection);
      if (Path.isDescendant(nodePath, panel.path) && Node.string(node) === '') {
        Transforms.unwrapNodes(editor, {
          match: node => node.type === 'blockquote',
          split: true,
        });
        return;
      }
    }
    insertBreak();
  };
  return editor;
};

export const BlockquoteElement = ({ attributes, children }: RenderElementProps) => {
  return (
    <blockquote
      css={{
        padding: '2px 8px',
        borderLeft: '3px solid #CBD5E0',
        margin: 0,
      }}
      {...attributes}
    >
      {children}
    </blockquote>
  );
};
