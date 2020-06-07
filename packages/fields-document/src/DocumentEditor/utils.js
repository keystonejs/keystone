import { Editor, Text } from 'slate';

export const getBlockAboveSelection = editor =>
  Editor.above(editor, {
    match: n => Editor.isBlock(editor, n),
  }) || [editor, []];

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  });

  return !!match;
};

export const isBlockTextEmpty = node => {
  const lastChild = node.children[node.children.length - 1];
  return Text.isText(lastChild) && !lastChild.text.length;
};
