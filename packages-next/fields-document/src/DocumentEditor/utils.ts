import React, { useCallback, useEffect, useRef, useState, useContext } from 'react';
import { Editor, Node, NodeEntry, Path, Transforms, Element, PathRef, Text } from 'slate';
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

export function clearFormatting(editor: Editor) {
  Transforms.unwrapNodes(editor, {
    match: node => node.type === 'heading' || node.type === 'blockquote' || node.type === 'code',
  });
  Transforms.unsetNodes(editor, allMarks, { match: Text.isText });
}

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

// this ensures that when changes happen, they are immediately shown
// this stops the problem of a cursor resetting to the end when a change is made
// because the changes are applied asynchronously
export function useElementWithSetNodes(editor: ReactEditor, element: Element) {
  const [state, setState] = useState({ element, elementWithChanges: element });
  if (state.element !== element) {
    setState({ element, elementWithChanges: element });
  }
  const setNodes = (changes: Partial<Element>) => {
    Transforms.setNodes(editor, changes, { at: ReactEditor.findPath(editor, element) });
    setState({ element, elementWithChanges: { ...element, ...changes } });
  };
  return [state.elementWithChanges, setNodes] as const;
}

export function useEventCallback<Func extends (...args: any) => any>(callback: Func): Func {
  const callbackRef = useRef(callback);
  const cb = useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
  useEffect(() => {
    callbackRef.current = callback;
  });
  return cb as any;
}

const IS_MAC =
  typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

export const modifierKeyText = IS_MAC ? '⌘' : 'Ctrl';

const ForceValidationContext = React.createContext(false);

export const ForceValidationProvider = ForceValidationContext.Provider;

export function useForceValidation() {
  return useContext(ForceValidationContext);
}

export function insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(
  editor: Editor,
  nodes: Node | Node[]
) {
  let pathRefForEmptyNodeAtCursor: PathRef | undefined;
  const entry = Editor.above(editor, {
    match: node => node.type === 'heading' || node.type === 'paragraph',
  });
  console.log(entry);
  if (entry && Node.string(entry[0]) === '') {
    console.log('is empty thing');
    pathRefForEmptyNodeAtCursor = Editor.pathRef(editor, entry[1]);
  }
  Transforms.insertNodes(editor, nodes);
  let path = pathRefForEmptyNodeAtCursor?.unref();
  if (path) {
    Transforms.removeNodes(editor, { at: path });
  }
}
