import {
  type Descendant,
  type NodeEntry,
  Editor,
  Element,
  Node,
  Path,
  Text,
  Transforms,
  createEditor,
} from 'slate'
import { withHistory } from 'slate-history'

import { type ComponentBlock } from './component-blocks/api-shared'
import { type DocumentFeatures } from '../views-shared'

import { withComponentBlocks } from './component-blocks/with-component-blocks'
import { withParagraphs } from './paragraphs'
import { withList } from './lists-shared'
import { withLink } from './link-shared'
import { withLayouts } from './layouts-shared'
import { withHeading } from './heading-shared'
import { withBlockquote } from './blockquote-shared'
import {
  type Relationships,
  withRelationship
} from './relationship-shared'
import { withDivider } from './divider-shared'
import { withCodeBlock } from './code-block-shared'
import { withMarks } from './marks'
import { withSoftBreaks } from './soft-breaks'
import { withShortcuts } from './shortcuts'
import { withDocumentFeaturesNormalization } from './document-features-normalization'
import { withInsertMenu } from './insert-menu-shared'
import { withBlockMarkdownShortcuts } from './block-markdown-shortcuts'
import { withPasting } from './pasting'

export type Block = Exclude<Element, { type: 'relationship' | 'link' }>

const blockquoteChildren = [
  'paragraph',
  'code',
  'heading',
  'ordered-list',
  'unordered-list',
  'divider',
] as const
const paragraphLike = [...blockquoteChildren, 'blockquote'] as const
const insideOfLayouts = [...paragraphLike, 'component-block'] as const

export const editorSchema = {
  editor: blockContainer({
    allowedChildren: [...insideOfLayouts, 'layout'],
    invalidPositionHandleMode: 'move',
  }),
  layout: blockContainer({ allowedChildren: ['layout-area'], invalidPositionHandleMode: 'move' }),
  'layout-area': blockContainer({
    allowedChildren: insideOfLayouts,
    invalidPositionHandleMode: 'unwrap',
  }),
  blockquote: blockContainer({
    allowedChildren: blockquoteChildren,
    invalidPositionHandleMode: 'move',
  }),
  paragraph: inlineContainer({ invalidPositionHandleMode: 'unwrap' }),
  code: inlineContainer({ invalidPositionHandleMode: 'move' }),
  divider: inlineContainer({ invalidPositionHandleMode: 'move' }),
  heading: inlineContainer({ invalidPositionHandleMode: 'unwrap' }),
  'component-block': blockContainer({
    allowedChildren: ['component-block-prop', 'component-inline-prop'],
    invalidPositionHandleMode: 'move',
  }),
  'component-inline-prop': inlineContainer({ invalidPositionHandleMode: 'unwrap' }),
  'component-block-prop': blockContainer({
    allowedChildren: paragraphLike,
    invalidPositionHandleMode: 'unwrap',
  }),
  'ordered-list': blockContainer({
    allowedChildren: ['list-item'],
    invalidPositionHandleMode: 'move',
  }),
  'unordered-list': blockContainer({
    allowedChildren: ['list-item'],
    invalidPositionHandleMode: 'move',
  }),
  'list-item': blockContainer({
    allowedChildren: ['list-item-content', 'ordered-list', 'unordered-list'],
    invalidPositionHandleMode: 'unwrap',
  }),
  'list-item-content': inlineContainer({ invalidPositionHandleMode: 'unwrap' }),
} satisfies Record<Block['type'] | 'editor', BlockContainerSchema | InlineContainerSchema>


type EditorSchema = typeof editorSchema
type InlineContainingType = {
  [Key in keyof EditorSchema]: { inlines: Key, blocks: never }[EditorSchema[Key]['kind']]
}[keyof EditorSchema]

function inlineContainer (args: {
  invalidPositionHandleMode: 'unwrap' | 'move'
}): InlineContainerSchema {
  return {
    kind: 'inlines',
    invalidPositionHandleMode: args.invalidPositionHandleMode,
  }
}

const inlineContainerTypes = new Set(
  Object.entries(editorSchema)
    .filter(([, value]) => value.kind === 'inlines')
    .map(([type]) => type)
)

type InlineContainerSchema = { kind: 'inlines', invalidPositionHandleMode: 'unwrap' | 'move' }

type TypesWhichHaveNoExtraRequiredProps = {
  [Type in Block['type']]: { type: Type, children: Descendant[] } extends Block & { type: Type }
    ? Type
    : never;
}[Block['type']]

type BlockContainerSchema = {
  kind: 'blocks'
  allowedChildren: ReadonlySet<Element['type']>
  blockToWrapInlinesIn: TypesWhichHaveNoExtraRequiredProps
  invalidPositionHandleMode: 'unwrap' | 'move'
}


export function isInlineContainer (node: Node): node is Block & { type: InlineContainingType } {
  return node.type !== undefined && inlineContainerTypes.has(node.type)
}

export function createDocumentEditor (
  documentFeatures: DocumentFeatures,
  componentBlocks: Record<string, ComponentBlock>,
  relationships: Relationships,
  slate?: {
    withReact: (editor: Editor) => any
    ReactEditor: {
      focus: (editor: Editor) => void
    }
  },
) {
  return withPasting(
    withSoftBreaks(
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
                                      withHistory(slate?.withReact(createEditor()) ?? createEditor())
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
  )
}

function blockContainer (args: {
  allowedChildren: readonly [TypesWhichHaveNoExtraRequiredProps, ...Block['type'][]]
  invalidPositionHandleMode: 'unwrap' | 'move'
}): BlockContainerSchema {
  return {
    kind: 'blocks',
    allowedChildren: new Set(args.allowedChildren),
    blockToWrapInlinesIn: args.allowedChildren[0],
    invalidPositionHandleMode: args.invalidPositionHandleMode,
  }
}

const blockTypes: Set<string | undefined> = new Set(
  Object.keys(editorSchema).filter(x => x !== 'editor')
)

export function isBlock (node: Descendant): node is Block {
  return blockTypes.has(node.type)
}

function withBlocksSchema (editor: Editor): Editor {
  const { normalizeNode } = editor
  editor.normalizeNode = ([node, path]) => {
    if (!Text.isText(node) && node.type !== 'link' && node.type !== 'relationship') {
      const nodeType = Editor.isEditor(node) ? 'editor' : node.type
      if (typeof nodeType !== 'string' || editorSchema[nodeType] === undefined) {
        Transforms.unwrapNodes(editor, { at: path })
        return
      }
      const info = editorSchema[nodeType]

      if (
        info.kind === 'blocks' &&
        node.children.length !== 0 &&
        node.children.every(child => !(Element.isElement(child) && Editor.isBlock(editor, child)))
      ) {
        Transforms.wrapNodes(
          editor,
          { type: info.blockToWrapInlinesIn, children: [] },
          { at: path, match: node => !(Element.isElement(node) && Editor.isBlock(editor, node)) }
        )
        return
      }

      for (const [index, childNode] of node.children.entries()) {
        const childPath = [...path, index]
        if (info.kind === 'inlines') {
          if (
            !Text.isText(childNode) &&
            !Editor.isInline(editor, childNode) &&
            // these checks are implicit in Editor.isBlock
            // but that isn't encoded in types so these will make TS happy
            childNode.type !== 'link' &&
            childNode.type !== 'relationship'
          ) {
            handleNodeInInvalidPosition(editor, [childNode, childPath], path)
            return
          }
        } else {
          if (
            !(Element.isElement(childNode) && Editor.isBlock(editor, childNode)) ||
            // these checks are implicit in Editor.isBlock
            // but that isn't encoded in types so these will make TS happy
            childNode.type === 'link' ||
            childNode.type === 'relationship'
          ) {
            Transforms.wrapNodes(
              editor,
              { type: info.blockToWrapInlinesIn, children: [] },
              { at: childPath }
            )
            return
          }
          if (
            Element.isElement(childNode) &&
            Editor.isBlock(editor, childNode) &&
            !info.allowedChildren.has(childNode.type)
          ) {
            handleNodeInInvalidPosition(editor, [childNode, childPath], path)
            return
          }
        }
      }
    }
    normalizeNode([node, path])
  }
  return editor
}

function handleNodeInInvalidPosition (
  editor: Editor,
  [node, path]: NodeEntry<Block>,
  parentPath: Path
) {
  const nodeType = node.type
  const childNodeInfo = editorSchema[nodeType]
  // the parent of a block will never be an inline so this casting is okay
  const parentNode = Node.get(editor, parentPath) as Block | Editor
  const parentNodeType = Editor.isEditor(parentNode) ? 'editor' : parentNode.type
  const parentNodeInfo = editorSchema[parentNodeType]

  if (!childNodeInfo || childNodeInfo.invalidPositionHandleMode === 'unwrap') {
    if (parentNodeInfo.kind === 'blocks' && parentNodeInfo.blockToWrapInlinesIn) {
      Transforms.setNodes(
        editor,
        {
          type: parentNodeInfo.blockToWrapInlinesIn,
          ...(Object.fromEntries(
            Object.keys(node)
              .filter(key => key !== 'type' && key !== 'children')
              .map(key => [key, null])
          ) as any), // the Slate types don't understand that null is allowed and it will unset properties with setNodes
        },
        { at: path }
      )
      return
    }
    Transforms.unwrapNodes(editor, { at: path })
    return
  }

  const info = editorSchema[parentNode.type || 'editor']
  if (info?.kind === 'blocks' && info.allowedChildren.has(nodeType)) {
    if (parentPath.length === 0) {
      Transforms.moveNodes(editor, { at: path, to: [path[0] + 1] })
    } else {
      Transforms.moveNodes(editor, { at: path, to: Path.next(parentPath) })
    }
    return
  }
  if (Editor.isEditor(parentNode)) {
    Transforms.moveNodes(editor, { at: path, to: [path[0] + 1] })
    Transforms.unwrapNodes(editor, { at: [path[0] + 1] })
    return
  }
  handleNodeInInvalidPosition(editor, [node, path], parentPath.slice(0, -1))
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
