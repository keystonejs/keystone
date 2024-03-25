import { type KeyboardEvent } from 'react'
import isHotkey from 'is-hotkey'
import {
  Editor,
  Node,
  Transforms,
  type NodeEntry,
  Element,
  Text,
  type Descendant,
  Path,
} from 'slate'
import { wrapLink } from './link-model'
import { clearFormatting, type Mark } from './utils-model'
import { nestList, unnestList } from './lists-model'

// the docs site needs access to Editor and importing slate would use the version from the content field
// so we're exporting it from here (note that this is not at all visible in the published version)
export { Editor } from 'slate'

const HOTKEYS: Record<string, Mark> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
}

function isMarkActive(editor: Editor, mark: Mark) {
  const marks = Editor.marks(editor)
  if (marks?.[mark]) {
    return true
  }
  // see the stuff about marks in toolbar-state for why this is here
  for (const entry of Editor.nodes(editor, { match: Text.isText })) {
    if (entry[0][mark]) {
      return true
    }
  }
  return false
}

export const getKeyDownHandler = (editor: Editor) => (event: KeyboardEvent) => {
  if (event.defaultPrevented) return
  for (const hotkey in HOTKEYS) {
    if (isHotkey(hotkey, event.nativeEvent)) {
      event.preventDefault()
      const mark = HOTKEYS[hotkey]
      const isActive = isMarkActive(editor, mark)
      if (isActive) {
        Editor.removeMark(editor, mark)
      } else {
        Editor.addMark(editor, mark, true)
      }
      return
    }
  }
  if (isHotkey('mod+\\', event.nativeEvent)) {
    clearFormatting(editor)
    return
  }
  if (isHotkey('mod+k', event.nativeEvent)) {
    event.preventDefault()
    wrapLink(editor, '')
    return
  }
  if (event.key === 'Tab') {
    const didAction = event.shiftKey ? unnestList(editor) : nestList(editor)
    if (didAction) {
      event.preventDefault()
      return
    }
  }
  if (event.key === 'Tab' && editor.selection) {
    const layoutArea = Editor.above(editor, {
      match: node => node.type === 'layout-area',
    })
    if (layoutArea) {
      const layoutAreaToEnter = event.shiftKey
        ? Editor.before(editor, layoutArea[1], { unit: 'block' })
        : Editor.after(editor, layoutArea[1], { unit: 'block' })
      Transforms.setSelection(editor, { anchor: layoutAreaToEnter, focus: layoutAreaToEnter })
      event.preventDefault()
    }
  }
}

const orderedListStyles = ['lower-roman', 'decimal', 'lower-alpha']
const unorderedListStyles = ['square', 'disc', 'circle']

export let styles: any = {
  flex: 1,
}

let listDepth = 10

while (listDepth--) {
  let arr = Array.from({ length: listDepth })
  if (arr.length) {
    styles[arr.map(() => `ol`).join(' ')] = {
      listStyle: orderedListStyles[listDepth % 3],
    }
    styles[arr.map(() => `ul`).join(' ')] = {
      listStyle: unorderedListStyles[listDepth % 3],
    }
  }
}

export type Block = Exclude<Element, { type: 'relationship' | 'link' }>

type BlockContainerSchema = {
  kind: 'blocks'
  allowedChildren: ReadonlySet<Element['type']>
  blockToWrapInlinesIn: TypesWhichHaveNoExtraRequiredProps
  invalidPositionHandleMode: 'unwrap' | 'move'
}

type InlineContainerSchema = { kind: 'inlines'; invalidPositionHandleMode: 'unwrap' | 'move' }

type TypesWhichHaveNoExtraRequiredProps = {
  [Type in Block['type']]: { type: Type; children: Descendant[] } extends Block & { type: Type }
    ? Type
    : never
}[Block['type']]

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

function blockContainer(args: {
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

function inlineContainer(args: {
  invalidPositionHandleMode: 'unwrap' | 'move'
}): InlineContainerSchema {
  return {
    kind: 'inlines',
    invalidPositionHandleMode: args.invalidPositionHandleMode,
  }
}

// a user land version of https://github.com/microsoft/TypeScript/issues/47920
function satisfies<Base>() {
  return function <Specific extends Base>(value: Specific) {
    return value
  }
}

type EditorSchema = typeof editorSchema

export const editorSchema = satisfies<
  Record<Block['type'] | 'editor', BlockContainerSchema | InlineContainerSchema>
>()({
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
})

type InlineContainingType = {
  [Key in keyof EditorSchema]: { inlines: Key; blocks: never }[EditorSchema[Key]['kind']]
}[keyof EditorSchema]

const inlineContainerTypes = new Set(
  Object.entries(editorSchema)
    .filter(([, value]) => value.kind === 'inlines')
    .map(([type]) => type)
)

export function isInlineContainer(node: Node): node is Block & { type: InlineContainingType } {
  return node.type !== undefined && inlineContainerTypes.has(node.type)
}

const blockTypes: Set<string | undefined> = new Set(
  Object.keys(editorSchema).filter(x => x !== 'editor')
)

export function isBlock(node: Descendant): node is Block {
  return blockTypes.has(node.type)
}

export function withBlocksSchema(editor: Editor): Editor {
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

function handleNodeInInvalidPosition(
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
