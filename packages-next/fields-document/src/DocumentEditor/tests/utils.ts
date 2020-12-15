import { ReactElement, createElement } from 'react';
import { Editor, Node, Path, Text, Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { createDocumentEditor } from '..';
import { ComponentBlock } from '../../component-blocks';
import { DocumentFeatures } from '../../views';

export { __jsx as jsx } from './jsx/namespace';

export const makeEditor = (
  node: Node,
  opts: {
    documentFeatures?: DocumentFeatures;
    componentBlocks?: Record<string, ComponentBlock>;
    allowNonNormalizedTree?: boolean;
  } = {}
): ReactEditor => {
  if (!Editor.isEditor(node)) {
    throw new Error('Unexpected non-editor passed to makeEditor');
  }
  let editor = createDocumentEditor(
    opts.documentFeatures || {
      alignment: { center: true, end: true },
      blockTypes: { blockquote: true, code: true, panel: true, quote: true },
      columns: [
        [1, 1],
        [1, 1, 1],
        [1, 2, 1],
      ],
      dividers: true,
      headingLevels: [1, 2, 3, 4, 5, 6],
      inlineMarks: {
        bold: true,
        code: true,
        italic: true,
        keyboard: true,
        strikethrough: true,
        subscript: true,
        superscript: true,
        underline: true,
      },
      link: true,
      listTypes: { ordered: true, unordered: true },
    },
    opts.componentBlocks || {}
  );
  editor.children = node.children;
  editor.selection = node.selection;

  if (!opts.allowNonNormalizedTree) {
    const selectionBeforeNormalize = editor.selection;
    const childrenBeforeNormalize = editor.children;

    Editor.normalize(editor, { force: true });

    expect(editor.children).toEqual(childrenBeforeNormalize);
    expect(editor.selection).toEqual(selectionBeforeNormalize);
  }
  return editor;
};

// we're converting the slate tree to react elements because Jest
// knows how to pretty-print react elements in snapshots
function nodeToReactElement(
  editor: Editor,
  node: Node,
  selection: Range | null,
  path: Path
): ReactElement {
  if (Text.isText(node)) {
    const { text, ...marks } = node;
    if (selection) {
      const stringifiedPath = JSON.stringify(path);
      const isAnchorInCurrentText = JSON.stringify(selection.anchor.path) === stringifiedPath;
      const isFocusInCurrentText = JSON.stringify(selection.focus.path) === stringifiedPath;

      if (isAnchorInCurrentText && isFocusInCurrentText) {
        if (selection.anchor.offset === selection.focus.offset) {
          return createElement('text', {
            children: [
              text.slice(0, selection.focus.offset),
              createElement('cursor'),
              text.slice(selection.focus.offset),
            ].filter(x => x),
            ...marks,
          });
        }
        const [startPoint, endPoint] = Range.edges(selection);
        const isBackward = Range.isBackward(selection);
        return createElement('text', {
          children: [
            text.slice(0, startPoint.offset),
            createElement(isBackward ? 'focus' : 'anchor'),
            text.slice(startPoint.offset, endPoint.offset),
            createElement(isBackward ? 'anchor' : 'focus'),
            text.slice(endPoint.offset),
          ].filter(x => x),
          ...marks,
        });
      }
      if (isAnchorInCurrentText || isFocusInCurrentText) {
        const point = isAnchorInCurrentText ? selection.anchor : selection.focus;
        return createElement('text', {
          children: [
            text.slice(0, point.offset),
            createElement(isAnchorInCurrentText ? 'anchor' : 'focus'),
            text.slice(point.offset),
          ].filter(x => x),
          ...marks,
        });
      }
    }
    return createElement('text', { children: text, ...marks });
  }
  let children = node.children.map((x, i) =>
    nodeToReactElement(editor, x, selection, path.concat(i))
  );
  if (Editor.isEditor(node)) {
    return createElement('editor', { children });
  }
  let { type, ...restNode } = node;
  const computedData: { '@@isVoid'?: true; '@@isInline'?: true } = {};
  if (editor.isVoid(node)) {
    computedData['@@isVoid'] = true;
  }
  if (editor.isInline(node)) {
    computedData['@@isInline'] = true;
  }
  if (type !== undefined) {
    return createElement(type as string, { ...restNode, ...computedData, children });
  }
  return createElement('element', { ...node, ...computedData, children });
}

expect.addSnapshotSerializer({
  test(val) {
    return Editor.isEditor(val);
  },
  serialize(val, config, indentation, depth, refs, printer) {
    return printer(
      nodeToReactElement(val, val, val.selection, []),
      config,
      indentation,
      depth,
      refs
    );
  },
});
