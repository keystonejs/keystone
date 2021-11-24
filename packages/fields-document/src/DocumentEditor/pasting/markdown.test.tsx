/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { makeEditor, jsx } from '../tests/utils';
import { MyDataTransfer } from './data-transfer';

const deserializeMarkdown = (markdown: string) => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>
  );
  const data = new MyDataTransfer();
  data.setData('text/plain', markdown);
  editor.insertData(data);
  return editor;
};

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
        <text>
          
        </text>
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            A link
          </text>
        </link>
        <text>
          
        </text>
      </paragraph>
      <paragraph>
        <text>
          ![An image](https://keystonejs.com/image.png)
        </text>
      </paragraph>
      <divider
        @@isVoid={true}
      >
        <text>
          
        </text>
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
          
        </text>
        <link
          @@isInline={true}
          href="http://keystonejs.com/link-reference"
        >
          <text>
            Link reference
          </text>
        </link>
        <text>
          
        </text>
      </paragraph>
      <paragraph>
        <text>
          ![Image reference](http://keystonejs.com/image-reference)
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

test('a mark stays in the same block', () => {
  expect(deserializeMarkdown(`__some bold content__`)).toMatchInlineSnapshot(`
    <editor
      marks={
        Object {
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
  `);
});

test('a link stays in the same block', () => {
  expect(deserializeMarkdown(`[link](https://keystonejs.com)`)).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          
        </text>
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            link
            <cursor />
          </text>
        </link>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('a link nested inside bold', () => {
  expect(deserializeMarkdown(`__content [link](https://keystonejs.com) content__`))
    .toMatchInlineSnapshot(`
    <editor
      marks={
        Object {
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
  `);
});
