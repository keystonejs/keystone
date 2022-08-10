import React, { ReactNode } from 'react';
import { RenderableTreeNode } from '@markdoc/markdoc';
import { transformDocContent } from '.';

function renderableToReactElement(node: RenderableTreeNode, key = 1): ReactNode {
  if (typeof node === 'string' || node === null) {
    return node;
  }
  return React.createElement(
    node.name,
    { ...node.attributes, key },
    node.children.map((child, i) => renderableToReactElement(child, i))
  );
}

expect.addSnapshotSerializer({
  test(val) {
    return typeof val === 'object' && val !== null && '$$mdtype' in val && val.$$mdtype === 'Tag';
  },
  serialize(val, config, indentation, depth, refs, printer) {
    return printer(renderableToReactElement(val), config, indentation, depth, refs);
  },
});

test('duplicate headings with disambiguated ids are allowed', () => {
  const content = `## Heading 1
## Heading 1 {% #some-heading %}
`;
  expect(transformDocContent('content.md', content)).toMatchInlineSnapshot(`
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
  `);
});

test("h1's are not allowed", () => {
  const content = `# Heading 1`;
  expect(() => transformDocContent('content.md', content)).toThrowErrorMatchingInlineSnapshot(`
    "Errors in content.md:
    content.md:1: H1's are not allowed, specify the title in frontmatter at the top of the file if you're trying to specify the page title, otherwise use a different heading level"
  `);
});

test('empty ids on headings are not allowed', () => {
  const content = `## ⭐️
###   

#### Blah {% id="" %}
`;
  expect(() => transformDocContent('content.md', content)).toThrowErrorMatchingInlineSnapshot(`
    "Errors in content.md:
    content.md:1: This heading has an empty id, change the heading content so that a non-empty id is generated or add {% #some-id %} after the heading
    content.md:2: This heading has an empty id, change the heading content so that a non-empty id is generated or add {% #some-id %} after the heading
    content.md:4: This heading has an empty id, change the heading content so that a non-empty id is generated or add {% #some-id %} after the heading"
  `);
});
