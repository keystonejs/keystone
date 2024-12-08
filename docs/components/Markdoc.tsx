'use client'

import React, { type ElementType, type ReactNode } from 'react'
import type { RenderableTreeNodes, Scalar, RenderableTreeNode, Tag } from '@markdoc/markdoc'
import { isTag } from '../markdoc/isTag'
import { Code, InlineCode } from './primitives/Code'
import { Heading } from './docs/Heading'
import { RelatedContent } from './RelatedContent'
import { Well } from './primitives/Well'
import { YouTubeEmbed } from './primitives/YouTubeEmbed'
import { Emoji } from './primitives/Emoji'
import { ComingSoon } from './docs/ComingSoon'

const renderers: Record<string, ElementType> = {
  code: InlineCode,
  CodeBlock (props: { content: string, language: string }) {
  return (
      <pre>
        <Code className={`language-${props.language}`}>{props.content}</Code>
      </pre>
    )
  },
  ComingSoon,
  Emoji,
  Well,
  YouTubeEmbed,
  RelatedContent,
  Heading (props: { children: ReactNode, level: 1 | 2 | 3 | 4 | 5 | 6, id: string }) {
    return <Heading {...props} />
  },
}

// inlined from markdoc because
// - it's so trivial to write
// - the markdoc implementation was doing weird things with the components(you couldn't override built in tags)
// - to avoid bundling all of markdoc on the front-end
export function Markdoc (props: { content: RenderableTreeNodes }) {
  function deepRender (value: any): any {
    if (value == null || typeof value !== 'object') return value

    if (Array.isArray(value)) return value.map(item => deepRender(item))

    if (value.$$mdtype === 'Tag') return render(value)

    if (typeof value !== 'object') return value

    const output: Record<string, Scalar> = {}
    for (const [k, v] of Object.entries(value)) output[k] = deepRender(v)
    return output
  }

  function render (node: RenderableTreeNodes): ReactNode {
    if (Array.isArray(node)) {
      return React.createElement(React.Fragment, null, ...node.map(render))
    }

    if (
      typeof node === 'string' ||
      typeof node === 'number' ||
      typeof node === 'boolean' ||
      node === null
    ) {
      return node
    }
    if (!isTag(node)) return null

    const { name, attributes: { class: className, ...attrs } = {}, children = [] } = node

    if (className) attrs.className = className
    let elementType = renderers[name]
    if (elementType === undefined) {
      if (name[0].toLowerCase() === name[0]) {
        elementType = name as ElementType
      } else {
        throw new Error(`No renderer provided for element type: ${name}`)
      }
    }

    return React.createElement(
      elementType,
      Object.keys(attrs).length == 0 ? null : deepRender(attrs),
      ...children.map(render)
    )
  }

  return render(props.content) as JSX.Element
}