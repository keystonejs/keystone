import { Editor, Text, Transforms } from 'slate';

export const DEBUG = false;
export const debugLog = (...args) => DEBUG && console.log(...args);

export const LIST_TYPES = ['ordered-list', 'unordered-list'];

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  });

  return !!match;
};

export const getBlockAboveSelection = editor =>
  Editor.above(editor, {
    match: n => Editor.isBlock(editor, n),
  }) || [editor, []];

export const isBlockTextEmpty = node => {
  const lastChild = node.children[node.children.length - 1];
  return Text.isText(lastChild) && !lastChild.text.length;
};

export const isFirstChild = path => path[path.length - 1] === 0;

export const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};
