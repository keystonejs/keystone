import type { Node as MarkdocNode, NodeType } from '#markdoc'
import { Ast } from '#markdoc'
import type { Fragment, Mark, Node as ProseMirrorNode } from 'prosemirror-model'
import type { EditorSchema } from '../schema'
import { getEditorSchema } from '../schema'
import { internalToSerialized } from '../props-serialization'
import { textblockChildren } from '../serialize-inline'

type DocumentSerializationState = {
  schema: EditorSchema
}

function _blocks(fragment: Fragment, state: DocumentSerializationState): MarkdocNode[] {
  const children: MarkdocNode[] = []
  fragment.forEach(child => {
    children.push(proseMirrorToMarkdoc(child, state))
  })
  return children
}

function _inline(fragment: Fragment, state: DocumentSerializationState): MarkdocNode[] {
  return [
    new Ast.Node(
      'inline',
      {},
      textblockChildren(
        fragment,
        (content): MarkdocNode => new Ast.Node('text', { content }),
        node => getLeafContent(node, state),
        mark => getWrapperForMark(mark, state)
      )
    ),
  ]
}

function getLeafContent(
  node: ProseMirrorNode,
  state: DocumentSerializationState
): MarkdocNode | undefined {
  const { schema } = state
  if (node.type === schema.nodes.hard_break) {
    return new Ast.Node('hardbreak')
  }

  const componentConfig = state.schema.components[node.type.name]
  if (componentConfig?.kind === 'inline') {
    const tag = new Ast.Node(
      'tag',
      internalToSerialized(componentConfig.schema, node.attrs.props),
      [],
      node.type.name
    )
    tag.inline = true
    return tag
  }
  if (node.text !== undefined) {
    return new Ast.Node(node.marks.some(x => x.type === schema.marks.code) ? 'code' : 'text', {
      content: node.text,
    })
  }
}

function getWrapperForMark(mark: Mark, state: DocumentSerializationState): MarkdocNode | undefined {
  const { schema } = state

  if (mark.type === schema.marks.code) {
    return
  }
  const componentConfig = schema.components[mark.type.name]
  if (componentConfig) {
    const node = new Ast.Node(
      'tag',
      internalToSerialized(componentConfig.schema, mark.attrs.props),
      [],
      mark.type.name
    )
    node.inline = true
    return node
  }

  let type: NodeType | undefined
  if (mark.type === schema.marks.bold) {
    type = 'strong'
  }
  if (mark.type === schema.marks.italic) {
    type = 'em'
  }
  if (mark.type === schema.marks.strikethrough) {
    type = 's'
  }

  if (type) {
    return new Ast.Node(type, {}, [])
  }
  if (mark.type === schema.marks.link) {
    return new Ast.Node('link', {
      href: mark.attrs.href,
      title: mark.attrs.title,
    })
  }
}

export function proseMirrorToMarkdoc(
  node: ProseMirrorNode,
  state: DocumentSerializationState
): MarkdocNode {
  const blocks = (fragment: Fragment) => _blocks(fragment, state)
  const inline = (fragment: Fragment) => _inline(fragment, state)
  const schema = getEditorSchema(node.type.schema)
  if (node.type === schema.nodes.doc) {
    return new Ast.Node('document', {}, blocks(node.content))
  }
  if (node.type === schema.nodes.paragraph) {
    return new Ast.Node('paragraph', {}, inline(node.content))
  }
  if (node.type === schema.nodes.blockquote) {
    return new Ast.Node('blockquote', {}, blocks(node.content))
  }
  if (node.type === schema.nodes.divider) {
    return new Ast.Node('hr')
  }
  if (node.type === schema.nodes.table) {
    const rows = blocks(node.content)
    const head = new Ast.Node('thead', {}, [])
    if (rows[0].children[0].type === 'th') {
      head.children.push(rows.shift()!)
    }
    const body = new Ast.Node('tbody', {}, rows)
    return new Ast.Node('tag', {}, [new Ast.Node('table', {}, [head, body])], 'table')
  }
  if (node.type === schema.nodes.table_row) {
    return new Ast.Node('tr', {}, blocks(node.content))
  }
  if (node.type === schema.nodes.table_header) {
    return new Ast.Node('th', {}, blocks(node.content))
  }
  if (node.type === schema.nodes.table_cell) {
    return new Ast.Node('td', {}, blocks(node.content))
  }
  if (node.type === schema.nodes.heading) {
    const markdocNode = new Ast.Node('heading', { level: node.attrs.level }, inline(node.content))
    return markdocNode
  }
  if (node.type === schema.nodes.code_block) {
    const markdocNode = new Ast.Node(
      'fence',
      typeof node.attrs.language === 'string' && node.attrs.language !== 'plain'
        ? { language: node.attrs.language, content: node.textBetween(0, node.content.size) + '\n' }
        : { content: node.textBetween(0, node.content.size) + '\n' },
      inline(node.content)
    )
    return markdocNode
  }
  if (node.type === schema.nodes.list_item) {
    let listItemContent = blocks(node.content)
    if (listItemContent.length === 1 && listItemContent[0].type === 'paragraph') {
      listItemContent = listItemContent[0].children
    } else if (
      listItemContent.length === 2 &&
      listItemContent[0].type === 'paragraph' &&
      listItemContent[0].children.length === 1 &&
      listItemContent[1].type === 'list'
    ) {
      listItemContent = [listItemContent[0].children[0], listItemContent[1]]
    }
    return new Ast.Node('item', {}, listItemContent)
  }
  if (node.type === schema.nodes.ordered_list) {
    return new Ast.Node('list', { ordered: true, start: node.attrs.start }, blocks(node.content))
  }
  if (node.type === schema.nodes.unordered_list) {
    return new Ast.Node('list', { ordered: false }, blocks(node.content))
  }

  const name = node.type.name
  const componentConfig = schema.components[name]
  if (componentConfig) {
    const children =
      componentConfig.kind === 'wrapper' || componentConfig.kind === 'repeating'
        ? blocks(node.content)
        : []
    return new Ast.Node(
      'tag',
      internalToSerialized(componentConfig.schema, node.attrs.props),
      children,
      name
    )
  }

  return new Ast.Node('paragraph', {}, inline(node.content))

  throw new Error('unhandled node type')
}
