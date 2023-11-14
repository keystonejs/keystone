/** @jest-environment jsdom */

import { htmlToEditor } from './test-utils'

test('whitespace between blocks is removed', () => {
  expect(htmlToEditor('<p>blah</p>\n<span>   \n </span>    <p>other</p>')).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          blah
        </text>
      </paragraph>
      <paragraph>
        <text>
          other
          <cursor />
        </text>
      </paragraph>
    </editor>
  `)
})

test('inline elements containing only whitespace are preserved', () => {
  expect(
    htmlToEditor(
      '<p>blah<span> </span>more<span>\n</span>other</p>\n<span>   \n </span>    <p>other</p>'
    )
  ).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          blah more
    other
        </text>
      </paragraph>
      <paragraph>
        <text>
          other
          <cursor />
        </text>
      </paragraph>
    </editor>
  `)
})

test('a link around blocks turn into links around text', () => {
  expect(
    htmlToEditor(
      '<a href="https://keystonejs.com"><p>blah</p>\n<span>   \n </span> <h1>some heading</h1>   <p>other</p></a>'
    )
  ).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text />
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            blah
          </text>
        </link>
        <text />
      </paragraph>
      <heading
        level={1}
      >
        <text />
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            some heading
          </text>
        </link>
        <text />
      </heading>
      <paragraph>
        <text />
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            other
          </text>
        </link>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>
  `)
})

test('marks around blocks turn into marks around text', () => {
  expect(
    htmlToEditor(
      '<kbd><a href="https://keystonejs.com"><strong><p>blah</p>\n<span>   \n </span></strong> <em><h1>some heading</h1>   <p>other</p></em></a></kbd>'
    )
  ).toMatchInlineSnapshot(`
    <editor
      marks={
        {
          "italic": true,
          "keyboard": true,
        }
      }
    >
      <paragraph>
        <text />
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text
            bold={true}
            keyboard={true}
          >
            blah
          </text>
        </link>
        <text />
      </paragraph>
      <heading
        level={1}
      >
        <text />
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text
            italic={true}
            keyboard={true}
          >
            some heading
          </text>
        </link>
        <text />
      </heading>
      <paragraph>
        <text />
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text
            italic={true}
            keyboard={true}
          >
            other
          </text>
        </link>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>
  `)
})

test('list items', () => {
  expect(
    htmlToEditor('<ul><li>blah<strong> this is bold</strong><ul><li>inner</li></ul></li></ul>')
  ).toMatchInlineSnapshot(`
    <editor>
      <unordered-list>
        <list-item>
          <list-item-content>
            <text>
              blah
            </text>
            <text
              bold={true}
            >
               this is bold
            </text>
          </list-item-content>
          <unordered-list>
            <list-item>
              <list-item-content>
                <text>
                  inner
                  <cursor />
                </text>
              </list-item-content>
            </list-item>
          </unordered-list>
        </list-item>
      </unordered-list>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

test('link, block and text as siblings', () => {
  expect(htmlToEditor('<a href="https://keystonejs.com">Something</a><h1>a</h1>other'))
    .toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text />
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            Something
          </text>
        </link>
        <text />
      </paragraph>
      <heading
        level={1}
      >
        <text>
          a
        </text>
      </heading>
      <paragraph>
        <text>
          other
          <cursor />
        </text>
      </paragraph>
    </editor>
  `)
})
