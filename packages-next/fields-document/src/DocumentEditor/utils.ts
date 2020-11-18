import {
  Editor,
  Element,
  Node,
  NodeEntry,
  Path,
  Text,
  Transforms,
} from 'slate';
import { ReactEditor } from 'slate-react';

export const DEBUG = false;
export const debugLog = (...args: any[]) => DEBUG && console.log(...args);

export type Mark = 'bold' | 'italic' | 'underline' | 'strikethrough';

export const isBlockActive = (editor: ReactEditor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });

  return !!match;
};

export function isContainerNode(node: Node): node is Element | Editor {
  return (
    Editor.isEditor(node) ||
    (Element.isElement(node) && node.type === 'paragraph')
  );
}

export function onlyContainerNodeInCurrentSelection(editor: ReactEditor) {
  // let editor;
  return [
    ...Editor.nodes(editor, {
      match: (node) => !Text.isText(node),
      mode: 'lowest',
    }),
  ].every(([node]) => isContainerNode(node));
}

export function moveChildren(
  editor: Editor,
  parent: NodeEntry | Path,
  to: Path
) {
  const parentPath = Path.isPath(parent) ? parent : parent[1];
  const parentNode = Path.isPath(parent)
    ? Node.get(editor, parentPath)
    : parent[0];
  if (!Editor.isBlock(editor, parentNode)) return;

  for (let i = parentNode.children.length - 1; i >= 0; i--) {
    const childPath = [...parentPath, i];
    Transforms.moveNodes(editor, { at: childPath, to });
  }
}

export const getBlockAboveSelection = (editor: ReactEditor) =>
  Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n),
  }) || [editor, []];

export const isLastBlockTextEmpty = (node: Element) => {
  const lastChild = node.children[node.children.length - 1];
  return Text.isText(lastChild) && !lastChild.text.length;
};

export const isFirstChild = (path: readonly number[]) =>
  path[path.length - 1] === 0;

export const isMarkActive = (editor: ReactEditor, format: Mark) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const toggleMark = (editor: ReactEditor, format: Mark) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};
