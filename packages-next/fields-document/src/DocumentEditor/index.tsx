/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import { KeyboardEvent, MutableRefObject, useState } from 'react';
import isHotkey from 'is-hotkey';
import { useCallback, useMemo } from 'react';
import {
  Editor,
  Node,
  Range,
  Transforms,
  createEditor,
  NodeEntry,
  Element,
  Text,
  Descendant,
  Path,
} from 'slate';
import { Editable, ReactEditor, Slate, useSlate, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import { withParagraphs } from './paragraphs';
import { withLink, wrapLink } from './link';
import { withLayouts } from './layouts';
import { clearFormatting, Mark } from './utils';
import { Toolbar } from './Toolbar';
import { renderElement } from './render-element';
import { withHeading } from './heading';
import { nestList, unnestList, withList } from './lists';
import { getPlaceholderTextForPropPath, withComponentBlocks } from './component-blocks';
import { withBlockquote } from './blockquote';
import { ComponentBlock } from '../component-blocks';
import { Relationships, withRelationship } from './relationship';
import { DocumentFeatures } from '../views';
import { withDivider } from './divider';
import { withCodeBlock } from './code-block';
import { withMarks } from './marks';
import { renderLeaf } from './leaf';
import { useKeyDownRef, withSoftBreaks } from './soft-breaks';
import { withShortcuts } from './shortcuts';
import { withDocumentFeaturesNormalization } from './document-features-normalization';
import { ToolbarStateProvider } from './toolbar-state';
import { withInsertMenu } from './insert-menu';
import { withBlockMarkdownShortcuts } from './block-markdown-shortcuts';
import { withPasting } from './pasting';

const HOTKEYS: Record<string, Mark> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
};

function isMarkActive(editor: Editor, mark: Mark) {
  const marks = Editor.marks(editor);
  if (marks?.[mark]) {
    return true;
  }
  // see the stuff about marks in toolbar-state for why this is here
  for (const entry of Editor.nodes(editor, { match: Text.isText })) {
    if (entry[0][mark]) {
      return true;
    }
  }
  return false;
}

const getKeyDownHandler = (editor: ReactEditor) => (event: KeyboardEvent) => {
  if (event.defaultPrevented) return;
  for (const hotkey in HOTKEYS) {
    if (isHotkey(hotkey, event.nativeEvent)) {
      event.preventDefault();
      const mark = HOTKEYS[hotkey];
      const isActive = isMarkActive(editor, mark);
      if (isActive) {
        Editor.removeMark(editor, mark);
      } else {
        Editor.addMark(editor, mark, true);
      }
      return;
    }
  }
  if (isHotkey('mod+\\', event.nativeEvent)) {
    clearFormatting(editor);
    return;
  }
  if (isHotkey('mod+k', event.nativeEvent)) {
    event.preventDefault();
    wrapLink(editor, '');
    return;
  }
  if (event.key === 'Tab') {
    if (event.shiftKey) {
      unnestList(editor);
    } else {
      nestList(editor);
    }
    event.preventDefault();
    return;
  }
  if (event.key === 'Tab' && editor.selection) {
    const layoutArea = Editor.above(editor, {
      match: node => node.type === 'layout-area',
    });
    if (layoutArea) {
      const layoutAreaToEnter = event.shiftKey
        ? Editor.before(editor, layoutArea[1], { unit: 'block' })
        : Editor.after(editor, layoutArea[1], { unit: 'block' });
      Transforms.setSelection(editor, { anchor: layoutAreaToEnter, focus: layoutAreaToEnter });
      event.preventDefault();
    }
  }
};

export function createDocumentEditor(
  documentFeatures: DocumentFeatures,
  componentBlocks: Record<string, ComponentBlock>,
  relationships: Relationships,
  isShiftPressedRef: MutableRefObject<boolean>
) {
  return withPasting(
    withSoftBreaks(
      isShiftPressedRef,
      withBlocksSchema(
        withLink(
          documentFeatures,
          componentBlocks,
          withList(
            withHeading(
              withRelationship(
                withInsertMenu(
                  withComponentBlocks(
                    componentBlocks,
                    documentFeatures,
                    relationships,
                    withParagraphs(
                      withShortcuts(
                        withDivider(
                          withLayouts(
                            withMarks(
                              documentFeatures,
                              componentBlocks,
                              withCodeBlock(
                                withBlockMarkdownShortcuts(
                                  documentFeatures,
                                  componentBlocks,
                                  withBlockquote(
                                    withDocumentFeaturesNormalization(
                                      documentFeatures,
                                      relationships,
                                      withHistory(withReact(createEditor()))
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );
}

export function DocumentEditor({
  autoFocus,
  onChange,
  value,
  componentBlocks,
  relationships,
  documentFeatures,
}: {
  autoFocus?: boolean;
  onChange: undefined | ((value: Node[]) => void);
  value: Node[];
  componentBlocks: Record<string, ComponentBlock>;
  relationships: Relationships;
  documentFeatures: DocumentFeatures;
}) {
  const isShiftPressedRef = useKeyDownRef('Shift');
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [editor, identity] = useMemo(
    () => [
      createDocumentEditor(documentFeatures, componentBlocks, relationships, isShiftPressedRef),
      Math.random().toString(36),
    ],
    [documentFeatures, componentBlocks, relationships]
  );

  useMemo(() => {
    findDuplicateNodes(value);
  }, [value]);

  return (
    <div
      css={
        expanded && {
          background: colors.background,
          bottom: 0,
          left: 0,
          overflowY: 'auto', // required to keep the toolbar stuck in place
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex: 100,
        }
      }
    >
      <Slate
        // this fixes issues with Slate crashing when a fast refresh occcurs
        key={identity}
        editor={editor}
        value={value}
        onChange={value => {
          onChange?.(value);
          // this fixes a strange issue in Safari where the selection stays inside of the editor
          // after a blur event happens but the selection is still in the editor
          // so the cursor is visually in the wrong place and it inserts text backwards
          const selection = window.getSelection();
          if (selection && !ReactEditor.isFocused(editor)) {
            const editorNode = ReactEditor.toDOMNode(editor, editor);
            if (selection.anchorNode === editorNode) {
              ReactEditor.focus(editor);
            }
          }
        }}
      >
        <ToolbarStateProvider
          componentBlocks={componentBlocks}
          editorDocumentFeatures={documentFeatures}
          relationships={relationships}
        >
          {useMemo(
            () => (
              <Toolbar
                documentFeatures={documentFeatures}
                viewState={{
                  expanded,
                  toggle: () => {
                    setExpanded(v => !v);
                  },
                }}
              />
            ),
            [expanded, documentFeatures]
          )}
          <DocumentEditorEditable
            autoFocus={!!autoFocus}
            componentBlocks={componentBlocks}
            editor={editor}
            readOnly={onChange === undefined}
          />
        </ToolbarStateProvider>

        {
          // for debugging
          false && <Debugger />
        }
      </Slate>
    </div>
  );
}

export function DocumentEditorEditable({
  editor,
  componentBlocks,
  autoFocus,
  readOnly,
}: {
  editor: ReactEditor;
  componentBlocks: Record<string, ComponentBlock>;
  autoFocus: boolean;
  readOnly: boolean;
}) {
  const onKeyDown = useMemo(() => getKeyDownHandler(editor), [editor]);

  return (
    <Editable
      decorate={useCallback(
        ([node, path]: NodeEntry<Node>) => {
          let decorations: Range[] = [];
          if (node.type === 'component-block' && Element.isElement(node)) {
            if (node.children.length === 1 && node.children[0].propPath === undefined) {
              return decorations;
            }
            node.children.forEach((child, index) => {
              if (Node.string(child) === '') {
                const start = Editor.start(editor, [...path, index]);
                const placeholder = getPlaceholderTextForPropPath(
                  child.propPath as any,
                  componentBlocks[node.component as string].props,
                  node.props as any
                );
                if (placeholder) {
                  decorations.push({
                    placeholder,
                    anchor: start,
                    focus: start,
                  });
                }
              }
            });
          }
          return decorations;
        },
        [editor]
      )}
      css={styles}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown}
      readOnly={readOnly}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
    />
  );
}

function Debugger() {
  const editor = useSlate();
  return (
    <pre>
      {JSON.stringify(
        {
          selection:
            editor.selection && Range.isCollapsed(editor.selection)
              ? editor.selection.anchor
              : editor.selection,
          marksWithoutCall: editor.marks,
          marks: Editor.marks(editor),
          children: editor.children,
        },
        null,
        2
      )}
    </pre>
  );
}

const orderedListStyles = ['lower-roman', 'decimal', 'lower-alpha'];
const unorderedListStyles = ['square', 'disc', 'circle'];

let styles: any = {};

let listDepth = 10;

while (listDepth--) {
  let arr = Array.from({ length: listDepth });
  if (arr.length) {
    styles[arr.map(() => `ol`).join(' ')] = {
      listStyle: orderedListStyles[listDepth % 3],
    };
    styles[arr.map(() => `ul`).join(' ')] = {
      listStyle: unorderedListStyles[listDepth % 3],
    };
  }
}

/**
 * Slate freaks out(which is quite expected ofc) if the
 * same nodes(as in ===, same shape is fine) are in the tree
 * multiple times so we'll validate it here to avoid running into it
 * strange and hard to debug problems
 */
function findDuplicateNodes(nodes: Node[], found: WeakSet<object> = new WeakSet()) {
  for (const node of nodes) {
    if (found.has(node)) {
      throw new Error('Duplicate node found: ' + JSON.stringify(node));
    }
    found.add(node);
    if (Array.isArray(node.children)) {
      findDuplicateNodes(node.children, found);
    }
  }
}

type EditorSchema = Record<
  string,
  | {
      kind: 'blocks';
      allowedChildren: ReadonlySet<string>;
      blockToWrapInlinesIn: string;
      invalidPositionHandleMode: 'unwrap' | 'move';
    }
  | { kind: 'inlines'; invalidPositionHandleMode: 'unwrap' | 'move' }
>;

function makeEditorSchema<
  Obj extends Record<
    string,
    | {
        kind: 'blocks';
        allowedChildren: readonly [Extract<keyof Obj, string>, ...Extract<keyof Obj, string>[]];
        invalidPositionHandleMode: 'unwrap' | 'move';
      }
    | { kind: 'inlines'; invalidPositionHandleMode: 'unwrap' | 'move' }
  >
>(obj: Obj) {
  let ret: EditorSchema = {};
  Object.keys(obj).forEach(key => {
    const val = obj[key];
    if (val.kind === 'blocks') {
      ret[key] = {
        kind: 'blocks',
        allowedChildren: new Set(val.allowedChildren),
        blockToWrapInlinesIn: val.allowedChildren[0],
        invalidPositionHandleMode: val.invalidPositionHandleMode,
      };
    } else {
      ret[key] = val;
    }
  });
  return ret;
}

const blockquoteChildren = [
  'paragraph',
  'code',
  'heading',
  'ordered-list',
  'unordered-list',
  'divider',
] as const;

const paragraphLike = [...blockquoteChildren, 'blockquote'] as const;

const insideOfLayouts = [...paragraphLike, 'component-block'] as const;

export const editorSchema = makeEditorSchema({
  editor: {
    kind: 'blocks',
    allowedChildren: [...insideOfLayouts, 'layout'],
    invalidPositionHandleMode: 'move',
  },
  layout: { kind: 'blocks', allowedChildren: ['layout-area'], invalidPositionHandleMode: 'move' },
  'layout-area': {
    kind: 'blocks',
    allowedChildren: insideOfLayouts,
    invalidPositionHandleMode: 'unwrap',
  },
  blockquote: {
    kind: 'blocks',
    allowedChildren: blockquoteChildren,
    invalidPositionHandleMode: 'move',
  },
  paragraph: { kind: 'inlines', invalidPositionHandleMode: 'unwrap' },
  code: { kind: 'inlines', invalidPositionHandleMode: 'move' },
  divider: { kind: 'inlines', invalidPositionHandleMode: 'move' },
  heading: {
    kind: 'inlines',
    invalidPositionHandleMode: 'unwrap',
  },
  'component-block': {
    kind: 'blocks',
    allowedChildren: ['component-block-prop', 'component-inline-prop'],
    invalidPositionHandleMode: 'move',
  },
  'component-inline-prop': { kind: 'inlines', invalidPositionHandleMode: 'unwrap' },
  'component-block-prop': {
    kind: 'blocks',
    allowedChildren: paragraphLike,
    invalidPositionHandleMode: 'unwrap',
  },
  'ordered-list': {
    kind: 'blocks',
    allowedChildren: ['list-item'],
    invalidPositionHandleMode: 'move',
  },
  'unordered-list': {
    kind: 'blocks',
    allowedChildren: ['list-item'],
    invalidPositionHandleMode: 'move',
  },
  'list-item': {
    kind: 'blocks',
    allowedChildren: ['list-item-content', 'ordered-list', 'unordered-list'],
    invalidPositionHandleMode: 'unwrap',
  },
  'list-item-content': { kind: 'inlines', invalidPositionHandleMode: 'unwrap' },
});

function withBlocksSchema<T extends Editor>(editor: T): T {
  const { normalizeNode } = editor;
  editor.normalizeNode = ([node, path]) => {
    if (Editor.isBlock(editor, node) || Editor.isEditor(node)) {
      const nodeType = Editor.isEditor(node) ? 'editor' : node.type;
      if (typeof nodeType !== 'string' || editorSchema[nodeType] === undefined) {
        Transforms.unwrapNodes(editor, { at: path });
        return;
      }
      const info = editorSchema[nodeType];
      for (const [index, childNode] of node.children.entries()) {
        const childPath = [...path, index];
        if (info.kind === 'inlines') {
          if (!Text.isText(childNode) && !Editor.isInline(editor, childNode)) {
            handleNodeInInvalidPosition(editor, [childNode, childPath], path);
            return;
          }
        } else {
          if (!Editor.isBlock(editor, childNode)) {
            Transforms.wrapNodes(
              editor,
              { type: info.blockToWrapInlinesIn, children: [] },
              { at: childPath }
            );
            return;
          }
          if (!info.allowedChildren.has(childNode.type as string)) {
            handleNodeInInvalidPosition(editor, [childNode, childPath], path);
            return;
          }
        }
      }
    }
    normalizeNode([node, path]);
  };
  return editor;
}

function handleNodeInInvalidPosition(
  editor: Editor,
  [node, path]: NodeEntry<Descendant>,
  parentPath: Path
) {
  const nodeType = node.type as string;
  const childNodeInfo = editorSchema[nodeType];

  if (!childNodeInfo || childNodeInfo.invalidPositionHandleMode === 'unwrap') {
    Transforms.unwrapNodes(editor, { at: path });
    return;
  }
  const parentNode = Node.get(editor, parentPath);
  const info =
    editorSchema[(parentNode.type as string) || Editor.isEditor(parentNode) ? 'editor' : ''];
  if (info?.kind === 'blocks' && info.allowedChildren.has(nodeType)) {
    Transforms.moveNodes(editor, { at: path, to: Path.next(parentPath) });
    return;
  }
  if (Editor.isEditor(parentNode)) {
    Transforms.moveNodes(editor, { at: path, to: [path[0] + 1] });
    Transforms.unwrapNodes(editor, { at: [path[0] + 1] });
    return;
  }
  handleNodeInInvalidPosition(editor, [node, path], parentPath.slice(0, -1));
}

// to print the editor schema in Graphviz if you want to visualize it
// function printEditorSchema(editorSchema: EditorSchema) {
//   return `digraph G {
//   concentrate=true;
//   ${Object.keys(editorSchema)
//     .map(key => {
//       let val = editorSchema[key];
//       if (val.kind === 'inlines') {
//         return `"${key}" -> inlines`;
//       }
//       if (val.kind === 'blocks') {
//         return `"${key}" -> {${[...val.allowedChildren].map(x => JSON.stringify(x)).join(' ')}}`;
//       }
//     })
//     .join('\n  ')}
// }`;
// }
