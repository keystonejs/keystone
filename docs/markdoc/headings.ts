


import type { RenderableTreeNode, Tag } from '@markdoc/markdoc'
import { isTag } from './isTag'

export type HeadingType = {
  id: string
  depth: number
  label: string
}

export function extractHeadings (content: Tag): HeadingType[] {
  const headings: HeadingType[] = []
  for (const child of content.children) {
    if (isTag(child) && child.name === 'Heading') {
      headings.push({
        id: child.attributes.id,
        depth: child.attributes.level,
        label: stringifyDocContent(child),
      })
    }
  }
  return headings
}

function stringifyDocContent (node: RenderableTreeNode): string {
  if (typeof node === 'string') {
    return node
  }
  if (Array.isArray(node)) {
    return node.map(stringifyDocContent).join('')
  }
  if (!isTag(node)) {
    return ''
  }
  return node.children.map(stringifyDocContent).join('')
}
