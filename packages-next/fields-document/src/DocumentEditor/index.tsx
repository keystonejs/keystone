/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import { KeyboardEvent, ReactNode, useState } from 'react';
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
import { Editable, ReactEditor, RenderLeafProps, Slate, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import { withParagraphs } from './paragraphs';
import { withLink } from './link';
import { ColumnOptionsProvider, withColumns } from './columns';
import { Mark, toggleMark } from './utils';
import { Toolbar } from './Toolbar';
import { renderElement } from './render-element';
import { withHeading } from './heading';
import { isListType, withList } from './lists';
import {
  ComponentBlockProvider,
  getPlaceholderTextForPropPath,
  VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP,
  withComponentBlocks,
} from './component-blocks';
import { withBlockquote } from './blockquote';
import { ComponentBlock } from '../component-blocks';
import {
  DocumentFieldRelationshipsProvider,
  Relationships,
  withRelationship,
} from './relationship';
import { DocumentFeatures } from '../views';
import { withDivider } from './divider';
import { withCodeBlock } from './code-block';

const HOTKEYS: Record<string, Mark> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
};

const getKeyDownHandler = (editor: ReactEditor) => (event: KeyboardEvent) => {
  for (const hotkey in HOTKEYS) {
    if (isHotkey(hotkey, event.nativeEvent)) {
      event.preventDefault();
      toggleMark(editor, HOTKEYS[hotkey]);
    }
  }
  if (event.key === 'Tab' && editor.selection && Range.isCollapsed(editor.selection)) {
    const block = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
    });

    if (block && block[0].type === 'list-item') {
      event.preventDefault();
      if (event.shiftKey) {
        Transforms.unwrapNodes(editor, {
          match: node => isListType(node.type as string),
          split: true,
        });
      } else {
        const type = Editor.parent(editor, block[1])[0].type as string;
        Transforms.wrapNodes(editor, {
          type,
          children: [],
        });
      }
    }
  }
};

/* Leaf Elements */

function Placeholder({ placeholder, children }: { placeholder: string; children: ReactNode }) {
  const [width, setWidth] = useState(0);
  return (
    <span css={{ position: 'relative', display: 'inline-block', width }}>
      <span
        contentEditable={false}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          display: 'inline-block',
          left: 0,
          top: 0,
          maxWidth: '100%',
          whiteSpace: 'nowrap',
          opacity: '0.5',
          userSelect: 'none',
          fontStyle: 'normal',
          fontWeight: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
        }}
      >
        <span
          ref={node => {
            if (node) {
              const offsetWidth = node.offsetWidth;
              if (offsetWidth !== width) {
                setWidth(offsetWidth);
              }
            }
          }}
        >
          {placeholder as string}
        </span>
      </span>
      {children}
    </span>
  );
}

const Leaf = ({ leaf, children, attributes }: RenderLeafProps) => {
  const { colors, radii, spacing, typography } = useTheme();
  const {
    underline,
    strikethrough,
    bold,
    italic,
    code,
    keyboard,
    superscript,
    subscript,
    placeholder,
  } = leaf;

  if (placeholder !== undefined) {
    children = <Placeholder placeholder={placeholder as string}>{children}</Placeholder>;
  }

  if (code) {
    children = (
      <code
        css={{
          backgroundColor: colors.backgroundDim,
          borderRadius: radii.xsmall,
          display: 'inline-block',
          fontFamily: typography.fontFamily.monospace,
          fontSize: typography.fontSize.small,
          padding: `0 ${spacing.xxsmall}px`,
        }}
      >
        {children}
      </code>
    );
  }
  if (bold) {
    children = <strong>{children}</strong>;
  }
  if (strikethrough) {
    children = <s>{children}</s>;
  }
  if (italic) {
    children = <em>{children}</em>;
  }
  if (keyboard) {
    children = <kbd>{children}</kbd>;
  }
  if (superscript) {
    children = <sup>{children}</sup>;
  }
  if (subscript) {
    children = <sub>{children}</sub>;
  }
  return (
    <span
      {...attributes}
      style={{
        textDecoration: underline ? 'underline' : undefined,
      }}
    >
      {children}
    </span>
  );
};

export function createDocumentEditor(
  documentFeatures: DocumentFeatures,
  componentBlocks: Record<string, ComponentBlock>
) {
  return withBlocksSchema(
    withLink(
      withList(
        documentFeatures.listTypes,
        withHeading(
          documentFeatures.headingLevels,
          withRelationship(
            withComponentBlocks(
              componentBlocks,
              withParagraphs(
                withDivider(
                  documentFeatures.dividers,
                  withColumns(
                    withCodeBlock(
                      documentFeatures.blockTypes.code,
                      withBlockquote(
                        documentFeatures.blockTypes.blockquote,
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
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const editor = useMemo(() => createDocumentEditor(documentFeatures, componentBlocks), [
    documentFeatures,
    componentBlocks,
  ]);

  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />;
  }, []);

  const onKeyDown = useMemo(() => getKeyDownHandler(editor), [editor]);

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
      <DocumentFieldRelationshipsProvider value={relationships}>
        <ColumnOptionsProvider value={documentFeatures.columns}>
          <ComponentBlockProvider value={componentBlocks}>
            <Slate
              editor={editor}
              value={value}
              onChange={value => {
                onChange?.(value);
              }}
            >
              <Toolbar
                documentFeatures={documentFeatures}
                viewState={useMemo(
                  () => ({
                    expanded,
                    toggle: () => {
                      setExpanded(v => !v);
                    },
                  }),
                  [expanded]
                )}
              />
              <Editable
                decorate={useCallback(
                  ([node, path]: NodeEntry<Node>) => {
                    let decorations: Range[] = [];
                    if (node.type === 'component-block' && Element.isElement(node)) {
                      if (
                        node.children.length === 1 &&
                        (node.children[0].propPath as any).length === 1 &&
                        (node.children[0].propPath as any)[0] ===
                          VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP
                      ) {
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

                          decorations.push({
                            placeholder,
                            anchor: start,
                            focus: start,
                          });
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
                readOnly={onChange === undefined}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
              />
            </Slate>
            {
              // for debugging
              false && <pre>{JSON.stringify(value, null, 2)}</pre>
            }
          </ComponentBlockProvider>
        </ColumnOptionsProvider>
      </DocumentFieldRelationshipsProvider>
    </div>
  );
}

const orderedListStyles = ['lower-roman', 'decimal', 'lower-alpha'];
const unorderedListStyles = ['square', 'disc', 'circle'];

let styles: any = {};

let listDepth = 10;

while (listDepth--) {
  let arr = Array.from({ length: listDepth });
  styles[arr.map(() => `ol`).join(' ')] = {
    listStyle: orderedListStyles[listDepth % 3],
  };
  styles[arr.map(() => `ul`).join(' ')] = {
    listStyle: unorderedListStyles[listDepth % 3],
  };
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

const listChildren = ['list-item', 'ordered-list', 'unordered-list'] as const;

export const editorSchema = makeEditorSchema({
  editor: {
    kind: 'blocks',
    allowedChildren: [...insideOfLayouts, 'columns'],
    invalidPositionHandleMode: 'move',
  },
  columns: { kind: 'blocks', allowedChildren: ['column'], invalidPositionHandleMode: 'move' },
  column: { kind: 'blocks', allowedChildren: insideOfLayouts, invalidPositionHandleMode: 'unwrap' },
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
    // TODO: not 100% sure that unwrap is right here
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
    allowedChildren: listChildren,
    invalidPositionHandleMode: 'move',
  },
  'unordered-list': {
    kind: 'blocks',
    allowedChildren: listChildren,
    invalidPositionHandleMode: 'move',
  },
  'list-item': { kind: 'inlines', invalidPositionHandleMode: 'unwrap' },
});

function withBlocksSchema(editor: ReactEditor) {
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

  if (childNodeInfo.invalidPositionHandleMode === 'unwrap') {
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
