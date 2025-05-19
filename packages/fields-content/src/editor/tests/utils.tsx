import ResizeObserver from 'resize-observer-polyfill'
import { createEditorState } from '../editor-state'
import type { EditorSchema } from '../schema'
import { createEditorSchema } from '../schema'
import type { Attrs, Mark } from 'prosemirror-model'
import { Node, NodeType, Schema } from 'prosemirror-model'
import { EditorState, NodeSelection, TextSelection } from 'prosemirror-state'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Editor } from '../index'
import { GapCursor } from '../gapcursor/gapcursor'
import { KeystarProvider } from '@keystar/ui/core'
import { createRef } from 'react'
import type { NewPlugin } from '@vitest/pretty-format'
import { plugins, format } from '@vitest/pretty-format'
import type { EditorView } from 'prosemirror-view'
import { editorStateToReactNode } from './editor-state-to-react-element'
import { editorOptionsToConfig } from '../../config'
import { expect } from 'vitest'

expect.addSnapshotSerializer(plugins.ReactElement)

// this polyfill is because jsdom doesn't have it and @floating-ui/react uses it
globalThis.ResizeObserver = ResizeObserver

type SelectionConfig =
  | {
      kind: 'text'
      anchor?: number
      head?: { pos: number; storedMarks: readonly Mark[] | null }
    }
  | {
      kind: 'node'
      pos: number
      storedMarks: readonly Mark[] | null
    }
  | {
      kind: 'gap'
      pos: number
      storedMarks: readonly Mark[] | null
    }

const nodesToSelectionConfig = new WeakMap<Node, SelectionConfig>()

function getSelectionConfig(node: Node) {
  return nodesToSelectionConfig.get(node)
}

function setSelectionConfig(node: Node, config: SelectionConfig) {
  nodesToSelectionConfig.set(node, config)
}

type SelectionInfo =
  | { kind: 'anchor' }
  | {
      kind: 'head' | 'cursor' | 'gap_cursor'
      storedMarks: Record<string, unknown> | undefined
    }

const {
  nodes: { selection_info: selectionInfoNode },
} = new Schema({
  nodes: {
    selection_info: {
      attrs: {
        info: {},
      },
    },
    text: {},
  },
  topNode: 'selection_info',
})

function marksFromProps(props: Record<string, unknown>, schema: Schema) {
  const marks: Mark[] = []
  for (const [key, value] of Object.entries(props)) {
    const markType = schema.marks[key]
    if (!markType) {
      throw new Error(`Unknown mark ${key}`)
    }
    marks.push(markType.create(value === true ? undefined : (value as Attrs)))
  }
  return marks
}

function createSelectionInfoNode(info: SelectionInfo) {
  return selectionInfoNode.create({ info })
}

function storedMarksFromMarksPropOnSelectionNode(marks: unknown, schema: Schema) {
  if (marks == null) {
    return null
  }
  return marksFromProps(marks as any, schema)
}

function getSelectionInfoFromNode(node: Node) {
  if (node.type !== selectionInfoNode) return null
  return node.attrs.info as SelectionInfo
}

const defaultEditorSchema = createEditorSchema(editorOptionsToConfig({}), {})

const defaultSchema = defaultEditorSchema.schema

const markNamesSet = new Set(Object.keys(defaultEditorSchema.marks))

for (const node of Object.values(defaultEditorSchema.nodes)) {
  const keys = Object.keys(node.spec.attrs ?? {})
  for (const key of keys) {
    if (markNamesSet.has(key)) {
      throw new Error(
        `Node ${node.name} has an attribute named ${key} that but there is also a mark with that name`
      )
    }
  }
}

export function jsx(
  _type:
    | keyof EditorSchema['nodes']
    | 'anchor'
    | 'head'
    | 'cursor'
    | 'gap_cursor'
    | 'node_selection'
    | NodeType,
  _props: Record<string, any> | null | undefined,
  ..._children: (string | EditorStateDescription | (string | EditorStateDescription)[])[]
): EditorStateDescription {
  const node = _jsx(
    _type,
    _props,
    ..._children.flat(1).map(x => {
      if (typeof x === 'string') {
        return x
      }
      if (x instanceof FakeEditorStateDescription) {
        return x.node
      }
      throw new Error(`invalid child ${x}`)
    })
  )
  if (node.type.name === 'doc') {
    return toEditorState(node)
  }
  return new FakeEditorStateDescription(node)
}

class FakeEditorStateDescription {
  #node: Node
  constructor(node: Node) {
    this.#node = node
  }
  get node() {
    return this.#node
  }
  get(): never {
    throw new Error('cannot get editor state from a non-doc node')
  }
}

function _jsx(
  _type:
    | keyof EditorSchema['nodes']
    | 'anchor'
    | 'head'
    | 'cursor'
    | 'gap_cursor'
    | 'node_selection'
    | NodeType,
  _props: Record<string, any> | null | undefined,
  ..._children: (string | Node)[]
): Node {
  const flatChildren = _children.flat(1)
  if (_type === 'anchor') {
    return createSelectionInfoNode({ kind: 'anchor' })
  }
  const props = _props ?? {}
  if (_type === 'gap_cursor' || _type === 'cursor' || _type === 'head') {
    return createSelectionInfoNode({
      kind: _type,
      storedMarks: props.marks,
    })
  }
  if (_type === 'node_selection') {
    if (flatChildren.length !== 1) {
      throw new Error('node_selection must have exactly one child')
    }
    const child = flatChildren[0]
    if (!(child instanceof Node)) {
      throw new Error('node_selection child must be a node')
    }
    const innerSelectionConfig = getSelectionConfig(child)
    if (innerSelectionConfig) {
      throw new Error('Node selection cannot have a selection config')
    }
    setSelectionConfig(child, {
      kind: 'node',
      pos: 0,
      storedMarks: storedMarksFromMarksPropOnSelectionNode(props.marks, child.type.schema),
    })
    return child
  }
  let type
  type = _type
  let schema = defaultSchema
  if (type instanceof NodeType) {
    schema = type.schema
    type = type.name
  }
  if (type === 'text') {
    let out = ''
    let selectionConfig: (SelectionConfig & { kind: 'text' }) | undefined
    for (const child of flatChildren) {
      if (typeof child === 'string') {
        out += child
        continue
      }
      const info = getSelectionInfoFromNode(child)
      if (info) {
        if (!selectionConfig) {
          selectionConfig = { kind: 'text' }
        }
        if (info.kind === 'anchor' || info.kind === 'cursor') {
          if (selectionConfig.anchor !== undefined) {
            throw new Error('Cannot have multiple anchors')
          }
          selectionConfig.anchor = out.length
        }
        if (info.kind === 'head' || info.kind === 'cursor') {
          if (selectionConfig.head !== undefined) {
            throw new Error('Cannot have multiple heads')
          }
          selectionConfig.head = {
            pos: out.length,
            storedMarks: storedMarksFromMarksPropOnSelectionNode(info.storedMarks, schema),
          }
        }
        continue
      }
      throw new Error('Text nodes can only contain strings or selection nodes')
    }

    const node = schema.text(out, marksFromProps(props, schema))
    if (selectionConfig) {
      setSelectionConfig(node, selectionConfig)
    }
    return node
  }
  let pos = 0
  const content: Node[] = []
  let selectionConfig: SelectionConfig | undefined
  for (const node of flatChildren) {
    if (!(node instanceof Node)) {
      throw new Error('Children of non-text nodes must only be other nodes')
    }
    const info = getSelectionInfoFromNode(node)
    if (info) {
      if (info.kind === 'gap_cursor') {
        if (selectionConfig !== undefined) {
          throw new Error('multiple selections')
        }
        selectionConfig = {
          kind: 'gap',
          pos,
          storedMarks: storedMarksFromMarksPropOnSelectionNode(info.storedMarks, schema),
        }
      }
      if (info.kind === 'anchor' || info.kind === 'cursor') {
        if (selectionConfig === undefined) {
          selectionConfig = { kind: 'text' }
        }
        if (selectionConfig.kind !== 'text') {
          throw new Error(
            `${selectionConfig.kind} selection cannot be combined with text selection`
          )
        }
        if (selectionConfig.anchor !== undefined) {
          throw new Error('multiple anchors')
        }
        selectionConfig.anchor = pos
      }
      if (info.kind === 'head' || info.kind === 'cursor') {
        if (selectionConfig === undefined) {
          selectionConfig = { kind: 'text' }
        }
        if (selectionConfig.kind !== 'text') {
          throw new Error(
            `${selectionConfig.kind} selection cannot be combined with text selection`
          )
        }
        if (selectionConfig.head !== undefined) {
          throw new Error('multiple heads')
        }
        selectionConfig.head = {
          pos,
          storedMarks: storedMarksFromMarksPropOnSelectionNode(info.storedMarks, schema),
        }
      }
      continue
    }
    if (node.type.schema !== schema) {
      throw new Error(
        `Node ${node.type.name} is from a different schema to the parent ${type} node`
      )
    }
    const childSelectionConfig = getSelectionConfig(node)
    if (childSelectionConfig) {
      if (childSelectionConfig.kind === 'gap' || childSelectionConfig.kind === 'node') {
        if (selectionConfig !== undefined) {
          throw new Error('multiple selections')
        }
        selectionConfig = {
          kind: childSelectionConfig.kind,
          pos: pos + childSelectionConfig.pos,
          storedMarks: childSelectionConfig.storedMarks,
        }
      } else {
        const start = (node.isText ? 0 : 1) + pos

        if (selectionConfig === undefined) {
          selectionConfig = { kind: 'text' }
        }
        if (selectionConfig.kind !== 'text') {
          throw new Error(
            `${selectionConfig.kind} selection cannot be combined with text selection`
          )
        }
        if (childSelectionConfig.anchor !== undefined) {
          if (selectionConfig.anchor !== undefined) {
            throw new Error('multiple anchors')
          }
          selectionConfig.anchor = start + childSelectionConfig.anchor
        }
        if (childSelectionConfig.head !== undefined) {
          if (selectionConfig.head !== undefined) {
            throw new Error('multiple heads')
          }
          selectionConfig.head = {
            pos: start + childSelectionConfig.head.pos,
            storedMarks: childSelectionConfig.head.storedMarks,
          }
        }
      }
    }
    pos += node.nodeSize
    content.push(node)
  }

  const node = schema.node(type, props, content)
  if (selectionConfig) {
    setSelectionConfig(node, selectionConfig)
  }
  return node
}

type NodeChildren = EditorStateDescription[] | EditorStateDescription

type Marks = {
  link?: { href: string; title: string }
} & {
  [Key in Exclude<keyof EditorSchema['marks'], 'link'>]?: true
}
export declare namespace jsx {
  namespace JSX {
    type IntrinsicElements = {
      text: {
        children: (string | EditorStateDescription)[] | string
      } & Marks
      doc: { children?: NodeChildren }
      code_block: { children?: NodeChildren; language: string }
      heading: { level: number; children?: NodeChildren }
      divider: { children?: NodeChildren }
      blockquote: { children?: NodeChildren }
      paragraph: { children?: NodeChildren }
      unordered_list: { children?: NodeChildren }
      ordered_list: { children?: NodeChildren }
      list_item: { children?: NodeChildren }
      anchor: { children?: undefined }
      head: { children?: undefined }
      cursor: { children?: undefined; marks?: Marks }
      gap_cursor: { children?: undefined; marks?: Marks }
      node_selection: { children: EditorStateDescription; marks?: Marks }
      table: { children?: NodeChildren }
      table_row: { children?: NodeChildren }
      table_cell: { children?: NodeChildren }
      table_header: { children?: NodeChildren }
    }
    type Element = EditorStateDescription
    interface ElementAttributesProperty {
      props: {}
    }
    interface ElementChildrenAttribute {
      children: {}
    }
  }
}

export function toEditorState(doc: Node): EditorStateDescription {
  if (!(doc instanceof Node)) {
    throw new Error('toEditorState only accepts a single node')
  }
  if (doc.type === selectionInfoNode) {
    throw new Error('toEditorState does not accept a selection info node')
  }
  const selectionConfig = getSelectionConfig(doc)
  let selection
  let storedMarks: readonly Mark[] | null = null
  if (selectionConfig?.kind === 'text') {
    if (selectionConfig.anchor === undefined) {
      throw new Error('missing anchor')
    }
    if (selectionConfig.head === undefined) {
      throw new Error('missing head')
    }
    const $head = doc.resolve(selectionConfig.head.pos)
    const $anchor = doc.resolve(selectionConfig.anchor)
    if (!$anchor.parent.inlineContent) {
      throw new Error('anchor must be in inline content when using text selections')
    }
    if (!$head.parent.inlineContent) {
      throw new Error('head must be in inline content when using text selections')
    }
    selection = new TextSelection($anchor, $head)
    storedMarks = selectionConfig.head.storedMarks
  }
  if (selectionConfig?.kind === 'gap') {
    const $pos = doc.resolve(selectionConfig.pos)
    if (!(GapCursor as any).valid($pos)) {
      throw new Error('invalid gap cursor position')
    }
    selection = new GapCursor($pos)
    storedMarks = selectionConfig.storedMarks
  }
  if (selectionConfig?.kind === 'node') {
    const node = doc.nodeAt(selectionConfig.pos)
    if (!node) {
      throw new Error(`node in node_selection not found`)
    }
    if (!NodeSelection.isSelectable(node)) {
      throw new Error(`node in node_selection is not selectable`)
    }
    selection = NodeSelection.create(doc, selectionConfig.pos)
    storedMarks = selectionConfig.storedMarks
  }
  return new RealEditorStateDescription(createEditorState(doc, selection, storedMarks))
}

Range.prototype.getClientRects = function getClientRects() {
  return [] as unknown as DOMRectList
}

const emptyRect: Omit<DOMRect, 'toJSON'> = {
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
}

Range.prototype.getBoundingClientRect = function getBoundingClientRect() {
  return {
    ...emptyRect,
    toJSON() {
      return emptyRect
    },
  }
}

export type User = ReturnType<(typeof userEvent)['setup']>

export async function undo(user: ReturnType<(typeof userEvent)['setup']>) {
  await user.keyboard('{Control>}z{/Control}')
}

export async function redo(user: ReturnType<(typeof userEvent)['setup']>) {
  await user.keyboard('{Control>}{Shift>}z{/Control}{/Shift}')
}

export function renderEditor(editorState: EditorStateDescription): {
  rendered: ReturnType<typeof render>
  user: ReturnType<(typeof userEvent)['setup']>
  state: () => EditorStateDescription
  contentElement: HTMLElement
} {
  const viewRef = createRef<{ view: EditorView | null }>()
  const user = userEvent.setup()
  const getElement = () => (
    <KeystarProvider>
      <Editor
        value={editorState.get()}
        ref={viewRef}
        onChange={state => {
          editorState = new RealEditorStateDescription(state)
          rendered.rerender(getElement())
        }}
      />
    </KeystarProvider>
  )
  const rendered = render(getElement())

  viewRef.current!.view!.focus()

  const contentElement = rendered.baseElement.querySelector('[contenteditable="true"]')!

  if (!(contentElement instanceof HTMLElement)) {
    throw new Error('content element not found/not HTMLElement')
  }

  return {
    state: () => editorState,
    user,
    rendered,
    contentElement,
  }
}

const editorStateSerializer: NewPlugin = {
  test(val) {
    return val instanceof EditorState
  },
  serialize(val: EditorState, config, indentation, depth, refs, printer) {
    return printer(editorStateToReactNode(val), config, indentation, depth, refs)
  },
}

export type EditorStateDescription = {
  get(): EditorState
}

class RealEditorStateDescription implements EditorStateDescription {
  #state: EditorState
  constructor(state: EditorState) {
    this.#state = state
  }
  get = () => {
    return this.#state
  }
  $$typeof = Symbol.for('jest.asymmetricMatcher')
  toString() {
    return 'EditorStateMatcher'
  }
  getExpectedType(): string {
    return 'editor state'
  }
  toAsymmetricMatcher = () => {
    return format(this.#state, {
      plugins: [editorStateSerializer, plugins.ReactElement],
      printBasicPrototype: false,
    })
  }
}

;(expect as any).addEqualityTesters([
  function (this: any, a: any, b: any) {
    return (
      a instanceof RealEditorStateDescription &&
      b instanceof RealEditorStateDescription &&
      this.equals(a.get().toJSON(), b.get().toJSON())
    )
  },
])
