import { Editor, Node, NodeEntry, Path, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

export { useEditor as useStaticEditor } from 'slate-react';

export type Mark =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'superscript'
  | 'subscript'
  | 'keyboard';

export const allMarks: Mark[] = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'code',
  'superscript',
  'subscript',
  'keyboard',
];

export const isBlockActive = (editor: ReactEditor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  });

  return !!match;
};

export function moveChildren(
  editor: Editor,
  parent: NodeEntry | Path,
  to: Path,
  shouldMoveNode: (node: Node) => boolean = () => true
) {
  const parentPath = Path.isPath(parent) ? parent : parent[1];
  const parentNode = Path.isPath(parent) ? Node.get(editor, parentPath) : parent[0];
  if (!Editor.isBlock(editor, parentNode)) return;

  for (let i = parentNode.children.length - 1; i >= 0; i--) {
    if (shouldMoveNode(parentNode.children[i])) {
      const childPath = [...parentPath, i];
      Transforms.moveNodes(editor, { at: childPath, to });
    }
  }
}

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
