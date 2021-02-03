import mdASTUtilFromMarkdown from 'mdast-util-from-markdown';
// @ts-ignore
import autoLinkLiteralFromMarkdownExtension from 'mdast-util-gfm-autolink-literal/from-markdown';
// @ts-ignore
import autoLinkLiteralMarkdownSyntax from 'micromark-extension-gfm-autolink-literal';
// @ts-ignore
import gfmStrikethroughFromMarkdownExtension from 'mdast-util-gfm-strikethrough/from-markdown';
// @ts-ignore
import gfmStrikethroughMarkdownSyntax from 'micromark-extension-gfm-strikethrough';
import definitions from 'mdast-util-definitions';
import { Descendant } from 'slate';
import { getTextNodeForCurrentlyActiveMarks, addMarkToChildren } from './utils';

const markdownConfig = {
  mdastExtensions: [autoLinkLiteralFromMarkdownExtension, gfmStrikethroughFromMarkdownExtension],
  extensions: [autoLinkLiteralMarkdownSyntax, gfmStrikethroughMarkdownSyntax()],
};

export function deserializeMarkdown(markdown: string) {
  const root = mdASTUtilFromMarkdown(markdown, markdownConfig);
  const getDefinition = definitions(root);
  let nodes = root.children;
  if (nodes.length === 1 && nodes[0].type === 'paragraph') {
    nodes = nodes[0].children;
  }
  return deserializeChildren(nodes, getDefinition);
}

type GetDefinition = ReturnType<typeof definitions>;

type MDNode = ReturnType<typeof mdASTUtilFromMarkdown>['children'][number];

function deserializeChildren(nodes: MDNode[], getDefinition: GetDefinition) {
  const outputNodes: Descendant[] = [];
  for (const node of nodes) {
    const result = deserializeMarkdownNode(node, getDefinition);
    if (result.length) {
      outputNodes.push(...result);
    }
  }
  if (!outputNodes.length) {
    outputNodes.push({ text: '' });
  }
  return outputNodes;
}

function deserializeMarkdownNode(node: MDNode, getDefinition: GetDefinition): Descendant[] {
  switch (node.type) {
    case 'blockquote': {
      return [{ type: 'blockquote', children: deserializeChildren(node.children, getDefinition) }];
    }
    case 'linkReference': {
      return [
        {
          type: 'link',
          href: getDefinition(node.identifier)?.url || '',
          children: deserializeChildren(node.children, getDefinition),
        },
      ];
    }
    case 'link': {
      return [
        {
          type: 'link',
          href: node.url,
          children: deserializeChildren(node.children, getDefinition),
        },
      ];
    }
    case 'code': {
      return [{ type: 'code', children: [{ text: node.value }] }];
    }
    case 'paragraph': {
      return [{ type: 'paragraph', children: deserializeChildren(node.children, getDefinition) }];
    }
    case 'heading': {
      return [
        {
          type: 'heading',
          level: node.depth,
          children: deserializeChildren(node.children, getDefinition),
        },
      ];
    }
    case 'list': {
      return [
        {
          type: node.ordered ? 'ordered-list' : 'unordered-list',
          children: deserializeChildren(node.children, getDefinition),
        },
      ];
    }
    case 'imageReference': {
      return [
        getTextNodeForCurrentlyActiveMarks(
          `![${node.alt || ''}](${getDefinition(node.identifier)?.url || ''})`
        ),
      ];
    }
    case 'image': {
      return [getTextNodeForCurrentlyActiveMarks(`![${node.alt || ''}](${node.url})`)];
    }
    case 'listItem': {
      return [{ type: 'list-item', children: deserializeChildren(node.children, getDefinition) }];
    }
    case 'thematicBreak': {
      return [{ type: 'divider', children: [{ text: '' }] }];
    }
    case 'break': {
      return [getTextNodeForCurrentlyActiveMarks('\n')];
    }
    case 'delete': {
      return addMarkToChildren('strikethrough', () =>
        deserializeChildren(node.children, getDefinition)
      );
    }
    case 'strong': {
      return addMarkToChildren('bold', () => deserializeChildren(node.children, getDefinition));
    }
    case 'emphasis': {
      return addMarkToChildren('italic', () => deserializeChildren(node.children, getDefinition));
    }
    case 'inlineCode': {
      return addMarkToChildren('code', () => [getTextNodeForCurrentlyActiveMarks(node.value)]);
    }
    // while it would be nice if we parsed the html here
    // it's a bit more complicated than just parsing the html
    // because an html node might just be an opening/closing node
    // but we just have an opening/closing node here
    // not the opening and closing and children
    case 'html':
    case 'text': {
      return [getTextNodeForCurrentlyActiveMarks(node.value)];
    }
  }
  return [];
}
