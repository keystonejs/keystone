import mdASTUtilFromMarkdown from 'mdast-util-from-markdown'
// @ts-expect-error
import autoLinkLiteralFromMarkdownExtension from 'mdast-util-gfm-autolink-literal/from-markdown'
// @ts-expect-error
import autoLinkLiteralMarkdownSyntax from 'micromark-extension-gfm-autolink-literal'
// @ts-expect-error
import gfmStrikethroughFromMarkdownExtension from 'mdast-util-gfm-strikethrough/from-markdown'
import gfmStrikethroughMarkdownSyntax from 'micromark-extension-gfm-strikethrough'
import { type Block } from '../editor-shared'
import {
  type InlineFromExternalPaste,
  addMarkToChildren,
  getInlineNodes,
  setLinkForChildren,
} from './utils'

const markdownConfig = {
  mdastExtensions: [autoLinkLiteralFromMarkdownExtension, gfmStrikethroughFromMarkdownExtension],
  extensions: [autoLinkLiteralMarkdownSyntax, gfmStrikethroughMarkdownSyntax()],
}

export function deserializeMarkdown (markdown: string) {
  const root = mdASTUtilFromMarkdown(markdown, markdownConfig)
  let nodes = root.children
  if (nodes.length === 1 && nodes[0].type === 'paragraph') {
    nodes = nodes[0].children
  }
  return deserializeChildren(nodes, markdown)
}

type MDNode = ReturnType<typeof mdASTUtilFromMarkdown>['children'][number]

function deserializeChildren (nodes: MDNode[], input: string) {
  const outputNodes: (InlineFromExternalPaste | Block)[] = []
  for (const node of nodes) {
    const result = deserializeMarkdownNode(node, input)
    if (result.length) {
      outputNodes.push(...result)
    }
  }
  if (!outputNodes.length) {
    outputNodes.push({ text: '' })
  }
  return outputNodes
}

function deserializeMarkdownNode (node: MDNode, input: string): (InlineFromExternalPaste | Block)[] {
  switch (node.type) {
    case 'blockquote': return [{ type: 'blockquote', children: deserializeChildren(node.children, input) }]
    case 'link': {
      // arguably this could just return a link node rather than use setLinkForChildren since the children _should_ only be inlines
      // but rather than relying on the markdown parser we use being correct in this way since it isn't nicely codified in types
      // let's be safe since we already have the code to do it the safer way because of html pasting
      return setLinkForChildren(node.url, () => deserializeChildren(node.children, input))
    }
    case 'code': return [{ type: 'code', children: [{ text: node.value }] }]
    case 'paragraph': return [{ type: 'paragraph', children: deserializeChildren(node.children, input) }]
    case 'heading': {
      return [
        {
          type: 'heading',
          level: node.depth,
          children: deserializeChildren(node.children, input),
        },
      ]
    }
    case 'list': {
      return [
        {
          type: node.ordered ? 'ordered-list' : 'unordered-list',
          children: deserializeChildren(node.children, input),
        },
      ]
    }
    case 'listItem': return [{ type: 'list-item', children: deserializeChildren(node.children, input) }]
    case 'thematicBreak': return [{ type: 'divider', children: [{ text: '' }] }]
    case 'break': return getInlineNodes('\n')
    case 'delete': return addMarkToChildren('strikethrough', () => deserializeChildren(node.children, input))
    case 'strong': return addMarkToChildren('bold', () => deserializeChildren(node.children, input))
    case 'emphasis': return addMarkToChildren('italic', () => deserializeChildren(node.children, input))
    case 'inlineCode': return addMarkToChildren('code', () => getInlineNodes(node.value))
    case 'text': return getInlineNodes(node.value)
  }
  return getInlineNodes(input.slice(node.position!.start.offset, node.position!.end.offset))
}
