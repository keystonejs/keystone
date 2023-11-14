import { type RenderableTreeNode } from '@markdoc/markdoc'
import React, { type ReactNode } from 'react'
import { isTag } from './isTag'
import { transformContent } from '.'

function renderableToReactElement (node: RenderableTreeNode, key = 1): ReactNode {
  if (
    typeof node === 'string' ||
    typeof node === 'number' ||
    typeof node === 'boolean' ||
    node === null
  ) {
    return node
  }
  if (Array.isArray(node)) {
    return node.map(renderableToReactElement)
  }
  if (isTag(node)) {
    return React.createElement(
      node.name,
      { ...node.attributes, key },
      node.children.map((child, i) => renderableToReactElement(child, i))
    )
  }
  return null
}

expect.addSnapshotSerializer({
  test (val) {
    return typeof val === 'object' && val !== null && '$$mdtype' in val && val.$$mdtype === 'Tag'
  },
  serialize (val, config, indentation, depth, refs, printer) {
    return printer(renderableToReactElement(val), config, indentation, depth, refs)
  },
})

test('duplicate headings without disambiguated ids error', () => {
  const content = `## Heading 1
## Heading 1
`
  expect(() => transformContent('content.md', content)).toThrowErrorMatchingInlineSnapshot(`
    "Errors in content.md:
    ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
    content.md:1: The id for this heading is "heading-1" which is the same as another heading in this file, disambiguate them with {% #some-id-here %} after a heading
    content.md:2: The id for this heading is "heading-1" which is the same as another heading in this file, disambiguate them with {% #some-id-here %} after a heading
    ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯"
  `)
})

test('duplicate headings with disambiguated ids are allowed', () => {
  const content = `## Heading 1
## Heading 1 {% #some-heading %}
`
  expect(transformContent('content.md', content)).toMatchInlineSnapshot(`
    <article>
      <Heading
        id="heading-1"
        level={2}
      >
        Heading 1
      </Heading>
      <Heading
        id="some-heading"
        level={2}
      >
        Heading 1 
      </Heading>
    </article>
  `)
})

test("h1's are not allowed", () => {
  const content = `# Heading 1`
  expect(() => transformContent('content.md', content)).toThrowErrorMatchingInlineSnapshot(`
    "Errors in content.md:
    ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
    content.md:1: H1's are not allowed, specify the title in frontmatter at the top of the file if you're trying to specify the page title, otherwise use a different heading level
    ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯"
  `)
})

test('empty ids on headings are not allowed', () => {
  const content = `## ⭐️
###   

#### Blah {% id="" %}
`
  expect(() => transformContent('content.md', content)).toThrowErrorMatchingInlineSnapshot(`
    "Errors in content.md:
    ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
    content.md:1: This heading has an empty id, change the heading content so that a non-empty id is generated or add {% #some-id %} after the heading
    content.md:2: This heading has an empty id, change the heading content so that a non-empty id is generated or add {% #some-id %} after the heading
    content.md:4: This heading has an empty id, change the heading content so that a non-empty id is generated or add {% #some-id %} after the heading
    ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯"
  `)
})

test('built-in Markdoc functions are not allowed', () => {
  const content = `
{% if or(true, false) %}

something

{% /if %}

`
  expect(() => transformContent('content.md', content)).toThrowErrorMatchingInlineSnapshot(`
    "Errors in content.md:
    ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
    content.md:2: Undefined function: 'or'
    ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯"
  `)
})
