import { Editor, Element, Node, NodeEntry, Path, Text, Transforms, Range } from 'slate';
import { ReactEditor } from 'slate-react';

export const DEBUG = false;
export const debugLog = (...args: any[]) => DEBUG && console.log(...args);

export type Mark = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code';

export const isBlockActive = (editor: ReactEditor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  });

  return !!match;
};

export function isContainerNode(node: Node): node is Element | Editor {
  return Editor.isEditor(node) || (Element.isElement(node) && node.type === 'paragraph');
}

export function onlyContainerNodeInCurrentSelection(editor: ReactEditor) {
  // let editor;
  return [
    ...Editor.nodes(editor, {
      match: node => !Text.isText(node),
      mode: 'lowest',
    }),
  ].every(([node]) => isContainerNode(node));
}

export function moveChildren(editor: Editor, parent: NodeEntry | Path, to: Path) {
  const parentPath = Path.isPath(parent) ? parent : parent[1];
  const parentNode = Path.isPath(parent) ? Node.get(editor, parentPath) : parent[0];
  if (!Editor.isBlock(editor, parentNode)) return;

  for (let i = parentNode.children.length - 1; i >= 0; i--) {
    const childPath = [...parentPath, i];
    Transforms.moveNodes(editor, { at: childPath, to });
  }
}

export const getBlockAboveSelection = (editor: ReactEditor) =>
  Editor.above(editor, {
    match: n => Editor.isBlock(editor, n),
  }) || [editor, []];

export const isLastBlockTextEmpty = (node: Element) => {
  const lastChild = node.children[node.children.length - 1];
  return Text.isText(lastChild) && !lastChild.text.length;
};

export const isFirstChild = (path: readonly number[]) => path[path.length - 1] === 0;

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

// TODO: maybe move all the usages of this into one place so we don't have to run this many times per keypress
export function getMaybeMarkdownShortcutText(text: string, editor: ReactEditor) {
  const { selection } = editor;
  if (text === ' ' && selection && Range.isCollapsed(selection)) {
    const { anchor } = selection;
    const block = Editor.above(editor, {
      match: n => n.type === 'paragraph',
    });
    const path = block ? block[1] : [];
    const start = Editor.start(editor, path);
    const range = { anchor, focus: start };
    return [
      Editor.string(editor, range),
      () => {
        Transforms.select(editor, range);
        Transforms.delete(editor);
      },
    ] as const;
  }
  return [undefined, () => {}] as const;
}
