/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, makeEditor } from './tests/utils'

test('sibling links with identical hrefs are merged', () => {
  const editor = makeEditor(
    <editor>
      <paragraph>
        <text />
        <link href="https://keystonejs.com">
          <text>blah </text>
        </link>
        <text />
        <link href="https://keystonejs.com">
          <text>other</text>
        </link>
        <text />
      </paragraph>
    </editor>,
    { normalization: 'normalize' }
  )
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text />
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            blah other
          </text>
        </link>
        <text />
      </paragraph>
    </editor>
  `)
})

test('sibling links with different hrefs are not merged', () => {
  makeEditor(
    <editor>
      <paragraph>
        <text />
        <link href="https://keystonejs.com">
          <text>blah </text>
        </link>
        <text />
        <link href="https://github.com/keystonejs/keystone">
          <text>other</text>
        </link>
        <text />
      </paragraph>
    </editor>,
    // this is the default(and that should never change), but just to be explicit:
    { normalization: 'disallow-non-normalized' }
  )
})

test('nested links are unwrapped and the outer link is used', () => {
  const editor = makeEditor(
    <editor>
      <paragraph>
        <text />
        <link href="https://keystonejs.com">
          <text>blah </text>
          <link href="https://github.com/keystonejs/keystone">
            <text>other</text>
          </link>
          <text />
        </link>
        <text />
      </paragraph>
    </editor>,
    { normalization: 'normalize' }
  )
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text />
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            blah other
          </text>
        </link>
        <text />
      </paragraph>
    </editor>
  `)
})

test('the children of the second link node are moved to the first link node in the right order', () => {
  const editor = makeEditor(
    <editor>
      <paragraph>
        <text />
        <link href="https://keystonejs.com">
          <text>blah </text>
        </link>
        <text />
        <link href="https://keystonejs.com">
          <text>first</text>
          <text bold>second</text>
          <text>third</text>
        </link>
        <text />
      </paragraph>
    </editor>,
    { normalization: 'normalize' }
  )
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text />
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            blah first
          </text>
          <text
            bold={true}
          >
            second
          </text>
          <text>
            third
          </text>
        </link>
        <text />
      </paragraph>
    </editor>
  `)
})
