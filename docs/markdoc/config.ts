import { Config, nodes, Tag, ValidationError, Node } from '@markdoc/markdoc';
import slugify from '@sindresorhus/slugify';

export const markdocConfig: Config = {
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
      transform(node, config) {
        const children = node.transformChildren(config);
        const attributes = node.transformAttributes(config);
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
            );
          }
          return child;
        });
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
    },
  },
  nodes: {
    fence: {
      render: 'CodeBlock',
      attributes: {
        content: { type: String, render: false, required: true },
        language: { type: String, default: 'typescript' },
        // process determines whether or not markdoc processes tags inside the content of the code block
        process: { type: Boolean, render: false, default: false },
      },
    },
    heading: {
      render: 'Heading',
      attributes: {
        level: { type: Number, required: true },
        id: { type: String },
      },
      validate(node) {
        const errors: ValidationError[] = [];
        if (node.attributes.level === 1) {
          errors.push({
            message:
              "H1's are not allowed, specify the title in frontmatter at the top of the file if you're trying to specify the page title, otherwise use a different heading level",
            id: 'no-h1',
            level: 'error',
          });
        }
        const id = getIdForHeading(node);
        if (id.length === 0) {
          errors.push({
            id: 'empty-id',
            level: 'error',
            message:
              'This heading has an empty id, change the heading content so that a non-empty id is generated or add {% #some-id %} after the heading',
          });
        }
        return errors;
      },
      transform(node, config) {
        const attributes = node.transformAttributes(config);
        const children = node.transformChildren(config);
        return new Tag(this.render, { ...attributes, id: getIdForHeading(node) }, children);
      },
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
};

function getIdForHeading(node: Node): string {
  if (typeof node.attributes.id === 'string') {
    return node.attributes.id;
  }
  let stringified = '';
  for (const child of node.walk()) {
    if (child.type === 'text' || child.type === 'code') {
      stringified += child.attributes.content;
    }
  }
  return slugify(stringified);
}
