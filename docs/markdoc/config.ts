import {
  type Config,
  nodes,
  Tag,
  type ValidationError,
  type Node,
  functions,
  type ConfigFunction,
} from '@markdoc/markdoc'
import slugify from '@sindresorhus/slugify'

export type Pages = Map<string, { ids: Set<string> }>

export const baseMarkdocConfig: Config = {
  // an empty variables object makes Markdoc validate against missing variables
  variables: {},
  // we want to disable the built-in functions
  functions: Object.fromEntries(
    Object.keys(functions).map(key => [key, undefined as unknown as ConfigFunction])
  ),
  validation: { validateFunctions: true },
  tags: {
    emoji: {
      render: 'Emoji',
      selfClosing: true,
      attributes: {
        symbol: { type: String, required: true },
        alt: { type: String, required: true },
      },
    },
    'coming-soon': {
      render: 'ComingSoon',
      selfClosing: true,
    },
    details: {
      render: 'details',
      children: nodes.document.children,
    },
    summary: {
      render: 'summary',
      children: nodes.document.children,
    },
    sup: {
      render: 'sup',
      children: nodes.strong.children,
    },
    hint: {
      children: ['paragraph'],
      attributes: {
        kind: { type: String, required: true, matches: ['warn', 'tip', 'error'] },
      },
      transform (node, config) {
        const children = node.transformChildren(config)
        const attributes = node.transformAttributes(config)
        return children.map(child => {
          if (child instanceof Tag) {
            return new Tag(
              child.name,
              {
                ...child.attributes,
                className: `${
                  child.attributes.className ? `${child.attributes.className} ` : ''
                }hint ${attributes.kind}`,
              },
              child.children
            )
          }
          return child
        })
      },
    },
    'related-content': {
      render: 'RelatedContent',
      children: ['tag'],
    },
    well: {
      render: 'Well',
      children: ['paragraph'],
      attributes: {
        heading: { type: String },
        href: { type: String },
        target: { type: String, matches: ['_blank'] },
      },
      validate: validateLink,
    },
    youtube: {
      render: 'YouTubeEmbed',
      attributes: {
        url: { type: String, required: true },
        label: { type: String, required: true },
      },
      selfClosing: true,
    },
  },
  nodes: {
    document: {
      ...nodes.document,
      validate (document) {
        const errors: ValidationError[] = []
        // we want good stable ids so we require documentation authors write ids
        // when they could be ambiguous rather than just adding an index
        const seenHeadings = new Map<string, Node | 'reported'>()
        for (const node of document.walk()) {
          if (node.type === 'heading') {
            const id = getIdForHeading(node)
            // we report an error for this in the heading validation
            if (id.length === 0) {
              continue
            }
            const existingHeading = seenHeadings.get(id)
            if (!existingHeading) {
              seenHeadings.set(id, node)
              continue
            }
            const ambiguousHeadingError = (node: Node): ValidationError => ({
              id: 'ambiguous-heading-id',
              level: 'error',
              message: `The id for this heading is "${id}" which is the same as another heading in this file, disambiguate them with {% #some-id-here %} after a heading`,
              location: node.location,
            })
            if (existingHeading !== 'reported') {
              errors.push(ambiguousHeadingError(existingHeading))
              seenHeadings.set(id, 'reported')
            }
            errors.push(ambiguousHeadingError(node))
          }
        }
        for (const node of document.walk()) {
          if (node.type === 'link' && node.attributes.href.startsWith('#')) {
            const id = node.attributes.href.slice(1)
            if (!seenHeadings.has(id)) {
              errors.push({
                id: 'missing-heading-id',
                level: 'error',
                message: `The link "${node.attributes.href}" doesn't point to an id in this file`,
                location: node.location,
              })
            }
          }
        }
        return errors
      },
    },
    fence: {
      render: 'CodeBlock',
      attributes: {
        content: { type: String, render: false, required: true },
        language: { type: String, default: 'typescript' },
        // process determines whether or not markdoc processes tags inside the content of the code block
        process: { type: Boolean, render: false, default: false },
      },
      transform (node, config) {
        const attributes = node.transformAttributes(config)
        const children = node.transformChildren(config)
        if (children.some(child => typeof child !== 'string')) {
          throw new Error(
            `unexpected non-string child of code block from ${
              node.location?.file ?? '(unknown file)'
            }:${node.location?.start.line ?? '(unknown line)'}`
          )
        }
        return new Tag(this.render, { ...attributes, content: children.join('') }, [])
      },
    },
    heading: {
      render: 'Heading',
      attributes: {
        level: { type: Number, required: true },
        id: { type: String },
      },
      validate (node) {
        const errors: ValidationError[] = []
        if (node.attributes.level === 1) {
          errors.push({
            message:
              "H1's are not allowed, specify the title in frontmatter at the top of the file if you're trying to specify the page title, otherwise use a different heading level",
            id: 'no-h1',
            level: 'error',
          })
        }
        const id = getIdForHeading(node)
        if (id.length === 0) {
          errors.push({
            id: 'empty-id',
            level: 'error',
            message:
              'This heading has an empty id, change the heading content so that a non-empty id is generated or add {% #some-id %} after the heading',
          })
        }
        return errors
      },
      transform (node, config) {
        const attributes = node.transformAttributes(config)
        const children = node.transformChildren(config)
        return new Tag(this.render, { ...attributes, id: getIdForHeading(node) }, children)
      },
    },
    link: {
      ...nodes.link,
      validate: validateLink,
    },
    image: {
      ...nodes.image,
      attributes: {
        ...nodes.image.attributes,
        width: { type: String },
        height: { type: String },
      },
    },
  },
}

function validateLink (node: Node, config: Config): ValidationError[] {
  const link = node.attributes.href
  if (
    /https?:\/\//.test(link) ||
    // local # is validated in the document validation
    link.startsWith('#') ||
    link.startsWith('mailto:')
  ) {
    return []
  }
  const pages: Pages | undefined = (config as any).pages
  if (/\.?\.?\//.test(link)) {
    if (!pages) return []
    const url = new URL(
      link,
      `https://example.com${node.location!.file!.replace(/^pages/, '').replace(/\.md$/, '')}`
    )
    const id = url.hash ? url.hash.slice(1) : undefined
    if (!pages.has(url.pathname)) {
      return [
        {
          id: 'invalid-link',
          level: 'error',
          message: `${link} points to a page that does not exist`,
        },
      ]
    }
    if (id === undefined || pages.get(url.pathname)!.ids.has(id)) return []
    return [
      {
        id: 'invalid-link',
        level: 'error',
        message: `${link} points to an id that does not exist`,
      },
    ]
  }
  return [{ id: 'invalid-link', level: 'error', message: 'Unknown link type' }]
}

export function getIdForHeading (node: Node): string {
  if (typeof node.attributes.id === 'string') {
    return node.attributes.id
  }
  let stringified = ''
  for (const child of node.walk()) {
    if (child.type === 'text' || child.type === 'code') {
      stringified += child.attributes.content
    }
  }
  return slugify(stringified)
}
