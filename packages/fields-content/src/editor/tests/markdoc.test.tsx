/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { expect, test } from 'vitest'
import type { EditorStateDescription } from './utils'
import { jsx, toEditorState } from './utils'
import { markdocToProseMirror } from '../markdoc/parse'
import { proseMirrorToMarkdoc } from '../markdoc/serialize'
import { format, parse } from '#markdoc'
import { createEditorSchema, getEditorSchema } from '../schema'
import { editorOptionsToConfig } from '../../config'
import { inline } from '@floating-ui/react'
import { mark, block } from '../../content-components'
import { fields } from '../../form/api'

const schema = createEditorSchema(editorOptionsToConfig({}), {
  highlight: mark({
    label: 'Highlight',
    icon: undefined!,
    className: 'highlight',
    schema: {
      variant: fields.select({
        label: 'Variant',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'success', label: 'Success' },
          { value: 'warning', label: 'Warning' },
          { value: 'danger', label: 'Danger' },
        ],
        defaultValue: 'default',
      }),
    },
  }),
  'with-array': block({
    label: 'With array',
    schema: {
      array: fields.array(fields.text({ label: 'Text' })),
    },
  }),
  'inline-thing': inline({
    label: 'Inline Thing',
    schema: {
      something: fields.text({ label: 'Something' }),
    },
  }),
  'string-directly-in-conditional': block({
    label: 'String directly in conditional',
    schema: {
      conditional: fields.conditional(fields.checkbox({ label: 'Checkbox' }), {
        true: fields.text({ label: 'True' }),
        false: fields.text({ label: 'False' }),
      }),
    },
  }),
})

function toMarkdoc(node: EditorStateDescription) {
  return format(
    parse(
      format(
        proseMirrorToMarkdoc(node.get().doc, {
          schema: getEditorSchema(node.get().schema),
        })
      )
    )
  )
}

function fromMarkdoc(markdoc: string) {
  return toEditorState(
    markdocToProseMirror(
      parse(markdoc),
      schema,
      new Map([['something something.png', new Uint8Array([])]]),
      undefined,
      undefined
    )
  )
}

test('basic', () => {
  expect(
    toMarkdoc(
      <doc>
        <paragraph>
          <text>Something</text>
        </paragraph>
        <heading level={1}>
          <text>Heading</text>
        </heading>
        <paragraph />
      </doc>
    )
  ).toMatchInlineSnapshot(`
    "Something

    # Heading
    "
  `)
})

test('nested list', () => {
  const markdoc = toMarkdoc(
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>Something</text>
          </paragraph>
          <unordered_list>
            <list_item>
              <paragraph>
                <text>Something</text>
              </paragraph>
            </list_item>
          </unordered_list>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  )
  expect(markdoc).toMatchInlineSnapshot(`
    "- Something
      - Something
    "
  `)
  expect(fromMarkdoc(markdoc)).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              <cursor />
              Something
            </text>
          </paragraph>
          <unordered_list>
            <list_item>
              <paragraph>
                <text>
                  Something
                </text>
              </paragraph>
            </list_item>
          </unordered_list>
        </list_item>
      </unordered_list>
    </doc>
  `)
})

test('inline code', () => {
  const markdoc = toMarkdoc(
    <doc>
      <paragraph>
        <text>Something</text>
      </paragraph>
      <heading level={1}>
        <text>Heading</text>
      </heading>
      <paragraph>
        <text code>a</text>
      </paragraph>
    </doc>
  )
  expect(markdoc).toMatchInlineSnapshot(`
    "Something

    # Heading

    \`a\`
    "
  `)
  expect(fromMarkdoc(markdoc)).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          <cursor />
          Something
        </text>
      </paragraph>
      <heading
        level={1}

      >
        <text>
          Heading
        </text>
      </heading>
      <paragraph>
        <text
          code={true}
        >
          a
        </text>
      </paragraph>
    </doc>
  `)
})

test('empty list item', () => {
  const markdoc = `- a
- `
  expect(fromMarkdoc(markdoc)).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              <cursor />
              a
            </text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph />
        </list_item>
      </unordered_list>
    </doc>
  `)
})

test('link in code', () => {
  const markdoc = `asdasdasd [\`something\`](https://keystatic.com)`
  const editor = fromMarkdoc(markdoc)
  expect(editor).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          <cursor />
          asdasdasd 
        </text>
        <text
          code={true}
          link={
            {
              "href": "https://keystatic.com",
              "title": "",
            }
          }
        >
          something
        </text>
      </paragraph>
    </doc>
  `)
  expect(toMarkdoc(editor)).toMatchInlineSnapshot(`
    "asdasdasd [\`something\`](https://keystatic.com)
    "
  `)
})

test('code and bold', () => {
  const markdoc = `fgdsihjnegrkdfmsjknefrds **\`a\`** fgbdv`
  const editor = fromMarkdoc(markdoc)
  expect(editor).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          <cursor />
          fgdsihjnegrkdfmsjknefrds 
        </text>
        <text
          bold={true}
          code={true}
        >
          a
        </text>
        <text>
           fgbdv
        </text>
      </paragraph>
    </doc>
  `)
  expect(toMarkdoc(editor)).toMatchInlineSnapshot(`
    "fgdsihjnegrkdfmsjknefrds **\`a\`** fgbdv
    "
  `)
})

test('link in list', () => {
  const markdoc = `1. uses the Next.js [App router](https://nextjs.org/docs/app)
`
  const editor = fromMarkdoc(markdoc)
  expect(editor).toMatchInlineSnapshot(`
    <doc>
      <ordered_list
        start={1}
      >
        <list_item>
          <paragraph>
            <text>
              <cursor />
              uses the Next.js 
            </text>
            <text
              link={
                {
                  "href": "https://nextjs.org/docs/app",
                  "title": "",
                }
              }
            >
              App router
            </text>
          </paragraph>
        </list_item>
      </ordered_list>
    </doc>
  `)
})

test('link in paragraph', () => {
  const markdoc = `uses the Next.js [App router](https://nextjs.org/docs/app)`
  const editor = fromMarkdoc(markdoc)
  expect(editor).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          <cursor />
          uses the Next.js 
        </text>
        <text
          link={
            {
              "href": "https://nextjs.org/docs/app",
              "title": "",
            }
          }
        >
          App router
        </text>
      </paragraph>
    </doc>
  `)
})

test('mark', () => {
  const markdoc = `{% highlight variant="success" %}some text{% /highlight %}`
  const editor = fromMarkdoc(markdoc)
  expect(editor).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          highlight={
            {
              "props": {
                "extraFiles": [],
                "value": {
                  "variant": "success",
                },
              },
            }
          }
        >
          <cursor />
          some text
        </text>
      </paragraph>
    </doc>
  `)
  expect(toMarkdoc(editor)).toMatchInlineSnapshot(`
    "{% highlight variant="success" %}some text{% /highlight %}
    "
  `)
})

test('hard break with two spaces', () => {
  const markdoc = `something  
something else`
  const editor = fromMarkdoc(markdoc)
  expect(editor).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          <cursor />
          something
        </text>
        <hard_break />
        <text>
          something else
        </text>
      </paragraph>
    </doc>
  `)
  expect(toMarkdoc(editor)).toMatchInlineSnapshot(`
    "something\\
    something else
    "
  `)
})

test('hard break with escape', () => {
  const markdoc = `something\\
something else`
  const editor = fromMarkdoc(markdoc)
  expect(editor).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          <cursor />
          something
        </text>
        <hard_break />
        <text>
          something else
        </text>
      </paragraph>
    </doc>
  `)
  expect(toMarkdoc(editor)).toMatchInlineSnapshot(`
    "something\\
    something else
    "
  `)
})

test('two hard breaks', () => {
  const editor = fromMarkdoc('something\\\n\\\nThe')
  expect(editor).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          <cursor />
          something
        </text>
        <hard_break />
        <hard_break />
        <text>
          The
        </text>
      </paragraph>
    </doc>
  `)
  expect(toMarkdoc(editor)).toMatchInlineSnapshot(`
    "something\\
    \\
    The
    "
  `)
})

test('inline', () => {
  const markdoc = `wertgrfdsc{% inline-thing something="adkjsakjndnajksdnjk" /%}sfasdf`
  const editor = fromMarkdoc(markdoc)
  expect(editor).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          <cursor />
          wertgrfdsc
        </text>
        <inline-thing
          props={
            {
              "extraFiles": [],
              "value": {
                "something": "adkjsakjndnajksdnjk",
              },
            }
          }
        />
        <text>
          sfasdf
        </text>
      </paragraph>
    </doc>
  `)
  expect(toMarkdoc(editor)).toMatchInlineSnapshot(`
    "wertgrfdsc{% inline-thing something="adkjsakjndnajksdnjk" /%}sfasdf
    "
  `)
})

test('add missing array field', () => {
  const editor = fromMarkdoc('{% with-array /%}')
  expect(editor).toMatchInlineSnapshot(`
    <doc>
      <node_selection>
        <with-array
          props={
            {
              "extraFiles": [],
              "value": {
                "array": [],
              },
            }
          }
        />
      </node_selection>
    </doc>
  `)
  expect(toMarkdoc(editor)).toMatchInlineSnapshot(`
    "{% with-array array=[] /%}
    "
  `)
})

test('undefined component', () => {
  expect(() => {
    fromMarkdoc('{% component-that-does-not-exist /%}')
  }).toThrowErrorMatchingInlineSnapshot(
    `"0:Missing component definition for component-that-does-not-exist"`
  )
})

test('optimal mark printing', () => {
  const markdoc = `**a *b* c**`
  const editor = fromMarkdoc(markdoc)
  expect(editor).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          bold={true}
        >
          <cursor />
          a 
        </text>
        <text
          bold={true}
          italic={true}
        >
          b
        </text>
        <text
          bold={true}
        >
           c
        </text>
      </paragraph>
    </doc>
  `)
  expect(toMarkdoc(editor)).toMatchInlineSnapshot(`
    "**a *b* c**
    "
  `)
})

test('more', () => {
  const markdoc = `\`a\` b **c** d *e* f`
  const editor = fromMarkdoc(markdoc)

  expect(toMarkdoc(editor)).toMatchInlineSnapshot(`
    "\`a\` b **c** d *e* f
    "
  `)
})

for (const [mark, symbol] of [
  ['bold', '**'],
  ['italic', '*'],
  ['strikethrough', '~~'],
] as const) {
  test(`whitespace is ejected from ${mark}`, () => {
    const editor = (
      <doc>
        <paragraph>
          <text>something</text>
          <text {...{ [mark]: true }}>
            <cursor /> a{' '}
          </text>
          <text>something</text>
        </paragraph>
      </doc>
    )
    expect(toMarkdoc(editor)).toBe(`something ${symbol}a${symbol} something\n`)
  })
}

test('inline in list item', () => {
  const markdoc = `- wertgrfdsc{% inline-thing something="adkjsakjndnajksdnjk" /%}sfasdf`
  const editor = fromMarkdoc(markdoc)
  expect(editor).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              <cursor />
              wertgrfdsc
            </text>
            <inline-thing
              props={
                {
                  "extraFiles": [],
                  "value": {
                    "something": "adkjsakjndnajksdnjk",
                  },
                }
              }
            />
            <text>
              sfasdf
            </text>
          </paragraph>
        </list_item>
      </unordered_list>
    </doc>
  `)
  expect(toMarkdoc(editor)).toMatchInlineSnapshot(`
    "- wertgrfdsc{% inline-thing something="adkjsakjndnajksdnjk" /%}sfasdf
    "
  `)
})

test('only inline in list item', () => {
  const markdoc = `- {% inline-thing something="adkjsakjndnajksdnjk" /%}`
  const editor = fromMarkdoc(markdoc)
  expect(editor).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <inline-thing
              props={
                {
                  "extraFiles": [],
                  "value": {
                    "something": "adkjsakjndnajksdnjk",
                  },
                }
              }
            />
          </paragraph>
        </list_item>
      </unordered_list>
    </doc>
  `)
  expect(toMarkdoc(editor)).toMatchInlineSnapshot(`
    "- {% inline-thing something="adkjsakjndnajksdnjk" /%}
    "
  `)
})

test('undefined in conditional value', () => {
  const markdoc = `{% string-directly-in-conditional conditional={discriminant:false} /%}`
  const editor = fromMarkdoc(markdoc)
  expect(editor).toMatchInlineSnapshot(`
    <doc>
      <node_selection>
        <string-directly-in-conditional
          props={
            {
              "extraFiles": [],
              "value": {
                "conditional": {
                  "discriminant": false,
                },
              },
            }
          }
        />
      </node_selection>
    </doc>
  `)
  expect(toMarkdoc(editor)).toMatchInlineSnapshot(`
    "{% string-directly-in-conditional conditional={discriminant: false} /%}
    "
  `)
})

test('ordered list with start', () => {
  const markdoc = `5. a
1. b
1. c`
  const editor = fromMarkdoc(markdoc)
  expect(toMarkdoc(editor)).toMatchInlineSnapshot(`
    "5. a
    1. b
    1. c
    "
  `)
})
