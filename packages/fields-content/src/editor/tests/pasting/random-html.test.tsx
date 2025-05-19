/** @jest-environment jsdom */

import { expect, test } from 'vitest'
import { htmlToEditor } from './utils'

test("whitespace between blocks isn't removed", async () => {
  expect(await htmlToEditor('<p>blah</p>\n<span>   \n </span>    <p>other</p>'))
    .toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          blah
        </text>
      </paragraph>
      <paragraph>
        <text>
           
        </text>
      </paragraph>
      <paragraph>
        <text>
          other
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test('inline elements containing only whitespace are preserved', async () => {
  expect(
    await htmlToEditor(
      '<p>blah<span> </span>more<span>\n</span>other</p>\n<span>   \n </span>    <p>other</p>'
    )
  ).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          blah more other
        </text>
      </paragraph>
      <paragraph>
        <text>
           
        </text>
      </paragraph>
      <paragraph>
        <text>
          other
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test('a link around blocks turn into links around text', async () => {
  expect(
    await htmlToEditor(
      '<a href="https://keystonejs.com"><p>blah</p>\n<span>   \n </span> <h1>some heading</h1>   <p>other</p></a>'
    )
  ).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          blah
        </text>
      </paragraph>
      <paragraph>
        <text
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
           
        </text>
      </paragraph>
      <heading
        level={1}

      >
        <text>
          some heading
        </text>
      </heading>
      <paragraph>
        <text>
          other
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test('marks around blocks turn into marks around text', async () => {
  expect(
    await htmlToEditor(
      '<kbd><a href="https://keystonejs.com"><strong><p>blah</p>\n<span>   \n </span></strong> <em><h1>some heading</h1>   <p>other</p></em></a></kbd>'
    )
  ).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          bold={true}
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          blah
        </text>
      </paragraph>
      <paragraph>
        <text
          bold={true}
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
           
        </text>
      </paragraph>
      <heading
        level={1}

      >
        <text
          italic={true}
        >
          some heading
        </text>
      </heading>
      <paragraph>
        <text
          italic={true}
        >
          other
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test('list items', async () => {
  expect(
    await htmlToEditor(
      '<ul><li>blah<strong> this is bold</strong><ul><li>inner</li></ul></li></ul>'
    )
  ).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              blah
            </text>
            <text
              bold={true}
            >
               this is bold
            </text>
          </paragraph>
          <unordered_list>
            <list_item>
              <paragraph>
                <text>
                  inner
                  <cursor />
                </text>
              </paragraph>
            </list_item>
          </unordered_list>
        </list_item>
      </unordered_list>
    </doc>
  `)
})

test('link, block and text as siblings', async () => {
  expect(await htmlToEditor('<a href="https://keystonejs.com">Something</a><h1>a</h1>other'))
    .toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          Something
        </text>
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
    </doc>
  `)
})

test('inline code bit', async () => {
  expect(
    await htmlToEditor(`<span>before<span> </span><code>Code</code><span> </span>end</span><div></div>
`)
  ).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          before 
        </text>
        <text
          code={true}
        >
          Code
        </text>
        <text>
           end
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})
