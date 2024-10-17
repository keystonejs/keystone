/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { Node } from 'slate'
import { makeEditor, jsx } from '../tests/utils'
import { MyDataTransfer } from './data-transfer'

const deserializeMarkdown = (markdown: string) => {
  const editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>
  )
  const data = new MyDataTransfer()
  data.setData('text/plain', markdown)
  editor.insertData(data)
  return editor
}

test('document with all the things', () => {
  expect(
    deserializeMarkdown(`# Heading 1

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
    <editor>
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
      <code>
        <text>
          some code
        </text>
      </code>
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
        <text />
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            A link
          </text>
        </link>
        <text />
      </paragraph>
      <paragraph>
        <text>
          ![An image](https://keystonejs.com/image.png)
        </text>
      </paragraph>
      <divider
        @@isVoid={true}
      >
        <text />
      </divider>
      <unordered-list>
        <list-item>
          <list-item-content>
            <text>
              unordered list
            </text>
          </list-item-content>
        </list-item>
        <list-item>
          <list-item-content>
            <text>
              item
            </text>
          </list-item-content>
        </list-item>
        <list-item>
          <list-item-content>
            <text>
              nested item
            </text>
          </list-item-content>
        </list-item>
      </unordered-list>
      <ordered-list>
        <list-item>
          <list-item-content>
            <text>
              ordered list
            </text>
          </list-item-content>
        </list-item>
        <list-item>
          <list-item-content>
            <text>
              item
            </text>
          </list-item-content>
          <ordered-list>
            <list-item>
              <list-item-content>
                <text>
                  nested item
                </text>
              </list-item-content>
            </list-item>
          </ordered-list>
        </list-item>
      </ordered-list>
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
    there is a break before this
        </text>
      </paragraph>
      <paragraph>
        <text>
          [Link reference][1]
        </text>
      </paragraph>
      <paragraph>
        <text>
          ![Image reference][2]
        </text>
      </paragraph>
      <paragraph>
        <text>
          [1]: http://keystonejs.com/link-reference
        </text>
      </paragraph>
      <paragraph>
        <text>
          [2]: http://keystonejs.com/image-reference
          <cursor />
        </text>
      </paragraph>
    </editor>
  `)
})

test('a mark stays in the same block', () => {
  expect(deserializeMarkdown(`__some bold content__`)).toMatchInlineSnapshot(`
    <editor
      marks={
        {
          "bold": true,
        }
      }
    >
      <paragraph>
        <text
          bold={true}
        >
          some bold content
          <cursor />
        </text>
      </paragraph>
    </editor>
  `)
})

test('a link stays in the same block', () => {
  expect(deserializeMarkdown(`[link](https://keystonejs.com)`)).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text />
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            link
          </text>
        </link>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>
  `)
})

test('a link nested inside bold', () => {
  expect(deserializeMarkdown(`__content [link](https://keystonejs.com) content__`))
    .toMatchInlineSnapshot(`
    <editor
      marks={
        {
          "bold": true,
        }
      }
    >
      <paragraph>
        <text
          bold={true}
        >
          content 
        </text>
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text
            bold={true}
          >
            link
          </text>
        </link>
        <text
          bold={true}
        >
           content
          <cursor />
        </text>
      </paragraph>
    </editor>
  `)
})

// this is written like this rather than a snapshot because the snapshot
// formatting creates html escapes(which is nice for the formatting)
// this test shows ensures that the snapshot formatting is not buggy
// and we're not showing html escapes to users or something
test('html in inline content is just written', () => {
  const input = `a<code>blah</code>b`
  expect(Node.string(deserializeMarkdown(input))).toEqual(input)
})

test('html in complex inline content', () => {
  expect(deserializeMarkdown(`__content [link<code>blah</code>](https://keystonejs.com) content__`))
    .toMatchInlineSnapshot(`
    <editor
      marks={
        {
          "bold": true,
        }
      }
    >
      <paragraph>
        <text
          bold={true}
        >
          content 
        </text>
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text
            bold={true}
          >
            link&lt;code&gt;blah&lt;/code&gt;
          </text>
        </link>
        <text
          bold={true}
        >
           content
          <cursor />
        </text>
      </paragraph>
    </editor>
  `)
})

// the difference between a delightful "oh, nice! the editor did the formatting i wanted"
// and "UGH!! the editor just removed some of the content i wanted" can be really subtle
// and while we want the delightful experiences, avoiding the bad experiences is _more important_

// so even though we could parse link references & definitions in some cases we don't because it feels a bit too magical
// also note that so the workaround of "paste into some plain text place, copy it from there"
// like html pasting doesn't exist here since this is parsing _from_ plain text
// so erring on the side of "don't be too smart" is better
test('link and image references and images are left alone', () => {
  const input = `[Link reference][1]

![Image reference][2]

![Image](http://keystonejs.com/image)

[1]: http://keystonejs.com/link-reference

[2]: http://keystonejs.com/image-reference`

  expect(
    deserializeMarkdown(input)
      .children.map(node => Node.string(node))
      .join('\n\n')
  ).toEqual(input)
})

// ideally, we would probably convert the mark here, but like the comment on the previous test says,
// it being not perfect is fine, as long as it doesn't make things _worse_
test('marks in image tags are converted', () => {
  const input = `![Image **blah**](https://keystonejs.com/image)`

  expect(deserializeMarkdown(input)).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          ![Image **blah**](https://keystonejs.com/image)
          <cursor />
        </text>
      </paragraph>
    </editor>
  `)
})
