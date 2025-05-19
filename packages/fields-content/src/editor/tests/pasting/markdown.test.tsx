/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { expect, test } from 'vitest'
import { renderEditor, jsx } from '../utils'
import { plainTextDataTransfer } from './utils'

async function deserializeMarkdown(markdown: string) {
  const { user, state } = renderEditor(
    <doc>
      <paragraph>
        <cursor />
      </paragraph>
    </doc>
  )
  await user.paste(plainTextDataTransfer(markdown))
  return state()
}

test('document with all the things', async () => {
  expect(
    await deserializeMarkdown(`# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

\`\`\`
some code
\`\`\`

> blockquote

**bold**

_italic_

~~strikethrough~~

\`inline code\`

[A link](https://keystonejs.com)

![An image](https://keystonejs.com/image.png)

---

- unordered list
- item
- nested item

1. ordered list
1. item
    1. nested item

<h1>this should just be plain text with the html tags</h1>

just some plain text

some text \\
there is a break before this

[Link reference][1]

![Image reference][2]

[1]: http://keystonejs.com/link-reference
[2]: http://keystonejs.com/image-reference
`)
  ).toMatchInlineSnapshot(`
    <doc>
      <heading
        level={1}

      >
        <text>
          Heading 1
        </text>
      </heading>
      <heading
        level={2}

      >
        <text>
          Heading 2
        </text>
      </heading>
      <heading
        level={3}

      >
        <text>
          Heading 3
        </text>
      </heading>
      <heading
        level={4}

      >
        <text>
          Heading 4
        </text>
      </heading>
      <heading
        level={5}

      >
        <text>
          Heading 5
        </text>
      </heading>
      <heading
        level={6}

      >
        <text>
          Heading 6
        </text>
      </heading>
      <code_block
        language=""

      >
        <text>
          some code
        </text>
      </code_block>
      <blockquote>
        <paragraph>
          <text>
            blockquote
          </text>
        </paragraph>
      </blockquote>
      <paragraph>
        <text
          bold={true}
        >
          bold
        </text>
      </paragraph>
      <paragraph>
        <text
          italic={true}
        >
          italic
        </text>
      </paragraph>
      <paragraph>
        <text
          strikethrough={true}
        >
          strikethrough
        </text>
      </paragraph>
      <paragraph>
        <text
          code={true}
        >
          inline code
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
          A link
        </text>
      </paragraph>
      <paragraph>
        <text>
          ![An image](https://keystonejs.com/image.png)
        </text>
      </paragraph>
      <divider />
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              unordered list
            </text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>
              item
            </text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>
              nested item
            </text>
          </paragraph>
        </list_item>
      </unordered_list>
      <ordered_list
        start={1}
      >
        <list_item>
          <paragraph>
            <text>
              ordered list
            </text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>
              item
            </text>
          </paragraph>
          <ordered_list
            start={1}
          >
            <list_item>
              <paragraph>
                <text>
                  nested item
                </text>
              </paragraph>
            </list_item>
          </ordered_list>
        </list_item>
      </ordered_list>
      <paragraph>
        <text>
          &lt;h1&gt;this should just be plain text with the html tags&lt;/h1&gt;
        </text>
      </paragraph>
      <paragraph>
        <text>
          just some plain text
        </text>
      </paragraph>
      <paragraph>
        <text>
          some text 
        </text>
        <hard_break />
        <text>
          there is a break before this
        </text>
      </paragraph>
      <paragraph>
        <text
          link={
            {
              "href": "http://keystonejs.com/link-reference",
              "title": "",
            }
          }
        >
          Link reference
        </text>
      </paragraph>
      <paragraph>
        <text>
          ![Image reference](http://keystonejs.com/image-reference)
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test('a mark stays in the same block', async () => {
  expect(await deserializeMarkdown(`__some bold content__`)).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          bold={true}
        >
          some bold content
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test('a link stays in the same block', async () => {
  expect(await deserializeMarkdown(`[link](https://keystonejs.com)`)).toMatchInlineSnapshot(`
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
          link
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test('a link nested inside bold', async () => {
  expect(await deserializeMarkdown(`__content[link](https://keystonejs.com) content__`))
    .toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          bold={true}
        >
          content
        </text>
        <text
          bold={true}
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          link
        </text>
        <text
          bold={true}
        >
           content
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

// this is written like this rather than a snapshot because the snapshot
// formatting creates html escapes(which is nice for the formatting)
// this test shows that the snapshot formatting is not buggy
// and we're not showing html escapes to users or something
test('html in inline content is just written', async () => {
  const input = `a<code>blah</code>b`
  const fromEditor = (await deserializeMarkdown(input)).get().doc.textContent
  expect(fromEditor).toBe(input)
})

test('html in complex inline content', async () => {
  expect(
    await deserializeMarkdown(`__content[link<code>blah</code>](https://keystonejs.com) content__`)
  ).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          bold={true}
        >
          content
        </text>
        <text
          bold={true}
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          link&lt;code&gt;blah&lt;/code&gt;
        </text>
        <text
          bold={true}
        >
           content
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test('marks in image tags are converted', async () => {
  const input = `![Image **blah**](https://keystonejs.com/image)`

  expect(await deserializeMarkdown(input)).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          ![Image **blah**](https://keystonejs.com/image)
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})
