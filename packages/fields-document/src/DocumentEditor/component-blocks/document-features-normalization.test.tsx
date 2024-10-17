/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { type Node } from 'slate'
import { component, fields } from '../../component-blocks'
import { makeEditor, jsx } from '../tests/utils'
import { type Children } from '../tests/jsx/namespace'
import { type ChildField } from './api'

const cases: Record<
  string,
  { schema: ChildField, children: Node | Node[], expectedNormalized?: Node }
> = {
  'mark where it should not exist in inline': {
    schema: fields.child({ kind: 'inline', placeholder: '' }),
    children: <text bold>this should not be bold</text>,
    expectedNormalized: <text>this should not be bold</text>,
  },
  'mark where it should not exist in block': {
    schema: fields.child({ kind: 'block', placeholder: '' }),
    children: (
      <paragraph>
        <text bold>this should not be bold</text>
      </paragraph>
    ),
    expectedNormalized: (
      <paragraph>
        <text>this should not be bold</text>
      </paragraph>
    ),
  },
  'mark where it is is allowed in inline': {
    schema: fields.child({ kind: 'inline', placeholder: '', formatting: 'inherit' }),
    children: <text bold>this should be bold</text>,
  },
  'code block where it is not allowed in a block': {
    schema: fields.child({ kind: 'block', placeholder: '' }),
    children: (
      <code>
        <text>this should not be in a code block</text>
      </code>
    ),
    expectedNormalized: (
      <paragraph>
        <text>this should not be in a code block</text>
      </paragraph>
    ),
  },
  'code block where it is allowed in a block': {
    schema: fields.child({ kind: 'block', placeholder: '', formatting: 'inherit' }),
    children: (
      <code>
        <text>this should not be in a code block</text>
      </code>
    ),
  },
  'links allowed': {
    schema: fields.child({ kind: 'block', placeholder: '', links: 'inherit' }),
    children: (
      <paragraph>
        <text>some text </text>
        <link href="https://example.com">
          <text>not in a link</text>
        </link>
        <text> stuff</text>
      </paragraph>
    ),
  },
  'links not allowed': {
    schema: fields.child({ kind: 'block', placeholder: '' }),
    children: (
      <paragraph>
        <text>some text </text>
        <link href="https://example.com">
          <text>not in a link</text>
        </link>
        <text> stuff</text>
      </paragraph>
    ),
    expectedNormalized: (
      <paragraph>
        <text>some text not in a link (https://example.com) stuff</text>
      </paragraph>
    ),
  },
  'links allowed in inline': {
    schema: fields.child({ kind: 'inline', placeholder: '', links: 'inherit' }),
    children: [
      <text>some text </text>,
      <link href="https://example.com">
        <text>not in a link</text>
      </link>,
      <text> stuff</text>,
    ],
  },
  'links not allowed in inline': {
    schema: fields.child({ kind: 'inline', placeholder: '' }),
    children: [
      <text>some text </text>,
      <link href="https://example.com">
        <text>not in a link</text>
      </link>,
      <text> stuff</text>,
    ],
    expectedNormalized: <text>some text not in a link (https://example.com) stuff</text>,
  },
  'relationship allowed': {
    schema: fields.child({ kind: 'block', placeholder: '', relationships: 'inherit' }),
    children: (
      <paragraph>
        <text>some text </text>
        <relationship
          relationship="mention"
          data={{
            id: '5f6a9d7ec229fe1621532769',
            label: 'Someone',
            data: {},
          }}
        >
          <text />
        </relationship>
        <text> stuff</text>
      </paragraph>
    ),
  },
  'relationship not allowed': {
    schema: fields.child({ kind: 'block', placeholder: '' }),
    children: (
      <paragraph>
        <text>some text </text>
        <relationship
          relationship="mention"
          data={{
            id: '5f6a9d7ec229fe1621532769',
            label: 'Someone',
            data: {},
          }}
        >
          <text />
        </relationship>
        <text> stuff</text>
      </paragraph>
    ),
    expectedNormalized: (
      <paragraph>
        <text>some text Someone (Mention:5f6a9d7ec229fe1621532769) stuff</text>
      </paragraph>
    ),
  },
  'alignment allowed': {
    schema: fields.child({ kind: 'block', placeholder: '', formatting: { alignment: 'inherit' } }),
    children: (
      <paragraph textAlign="end">
        <text>some text </text>
      </paragraph>
    ),
  },
  'alignment not allowed': {
    schema: fields.child({ kind: 'block', placeholder: '' }),
    children: (
      <paragraph textAlign="end">
        <text>some text </text>
      </paragraph>
    ),
    expectedNormalized: (
      <paragraph>
        <text>some text </text>
      </paragraph>
    ),
  },
  'divider allowed': {
    schema: fields.child({ kind: 'block', placeholder: '', dividers: 'inherit' }),
    children: [
      <paragraph>
        <text>some text </text>
      </paragraph>,
      <divider>
        <text />
      </divider>,
    ],
  },
  'divider not allowed': {
    schema: fields.child({ kind: 'block', placeholder: '' }),
    children: [
      <paragraph>
        <text>some text </text>
      </paragraph>,
      <divider>
        <text />
      </divider>,
    ],
    expectedNormalized: (
      <paragraph>
        <text>some text </text>
      </paragraph>
    ),
  },
  'soft breaks allowed': {
    schema: fields.child({ kind: 'block', placeholder: '', formatting: { softBreaks: 'inherit' } }),
    children: (
      <paragraph>
        <text>some{'\n'} text </text>
      </paragraph>
    ),
  },
  'soft breaks not allowed': {
    schema: fields.child({ kind: 'block', placeholder: '' }),
    children: (
      <paragraph>
        <text>
          some{'\n'} text {'\n'}
        </text>
        <text bold>{'\n'}s</text>
      </paragraph>
    ),
    expectedNormalized: (
      <paragraph>
        <text>some text s</text>
      </paragraph>
    ),
  },
}

function makeEditorWithChildField (
  childField: ChildField,
  children: Children,
  normalization: 'disallow-non-normalized' | 'normalize' | 'skip' = 'disallow-non-normalized'
) {
  const Prop = `component-${childField.options.kind}-prop` as const
  return makeEditor(
    <editor>
      <component-block component={'comp'} props={{ child: null }}>
        <Prop propPath={['child']}>{children}</Prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    {
      normalization,
      componentBlocks: {
        comp: component({ preview: () => null, label: '', schema: { child: childField } }),
      },
      relationships: {
        mention: {
          label: 'Mention',
          listKey: 'User',
          selection: null,
        },
      },
    }
  )
}

Object.keys(cases).forEach(key => {
  const testCase = cases[key]
  test(key, () => {
    const Prop = `component-${testCase.schema.options.kind}-prop` as const
    const editor = makeEditorWithChildField(
      testCase.schema,
      testCase.children,
      testCase.expectedNormalized === undefined ? 'disallow-non-normalized' : 'normalize'
    )
    if (testCase.expectedNormalized !== undefined) {
      expect(editor).toEqualEditor(
        makeEditor(
          <editor>
            <component-block component={'comp'} props={{ child: null }}>
              <Prop propPath={['child']}>{testCase.expectedNormalized}</Prop>
            </component-block>
            <paragraph>
              <text />
            </paragraph>
          </editor>
        )
      )
    }
  })
})

test('mark disabled in inline prop', () => {
  const editor = makeEditorWithChildField(
    fields.child({ kind: 'inline', placeholder: '' }),
    <text>
      **thing*
      <cursor />
    </text>
  )
  editor.insertText('*')
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="comp"
        props={
          {
            "child": null,
          }
        }
      >
        <component-inline-prop
          propPath={
            [
              "child",
            ]
          }
        >
          <text>
            **thing**
            <cursor />
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

test('mark enabled in inline prop', () => {
  const editor = makeEditorWithChildField(
    fields.child({ kind: 'inline', placeholder: '', formatting: { inlineMarks: 'inherit' } }),
    <text>
      **thing*
      <cursor />
    </text>
  )
  editor.insertText('*')
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="comp"
        props={
          {
            "child": null,
          }
        }
      >
        <component-inline-prop
          propPath={
            [
              "child",
            ]
          }
        >
          <text
            bold={true}
          >
            thing
            <cursor />
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

test('mark disabled in block prop', () => {
  const editor = makeEditorWithChildField(
    fields.child({ kind: 'block', placeholder: '' }),
    <paragraph>
      <text>
        **thing*
        <cursor />
      </text>
    </paragraph>
  )
  editor.insertText('*')
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="comp"
        props={
          {
            "child": null,
          }
        }
      >
        <component-block-prop
          propPath={
            [
              "child",
            ]
          }
        >
          <paragraph>
            <text>
              **thing**
              <cursor />
            </text>
          </paragraph>
        </component-block-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

test('mark enabled in block prop', () => {
  const editor = makeEditorWithChildField(
    fields.child({ kind: 'block', placeholder: '', formatting: { inlineMarks: 'inherit' } }),
    <paragraph>
      <text>
        **thing*
        <cursor />
      </text>
    </paragraph>
  )
  editor.insertText('*')
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="comp"
        props={
          {
            "child": null,
          }
        }
      >
        <component-block-prop
          propPath={
            [
              "child",
            ]
          }
        >
          <paragraph>
            <text
              bold={true}
            >
              thing
              <cursor />
            </text>
          </paragraph>
        </component-block-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

test('heading disabled in block prop', () => {
  const editor = makeEditorWithChildField(
    fields.child({ kind: 'block', placeholder: '' }),
    <paragraph>
      <text>
        ##
        <cursor />
      </text>
    </paragraph>
  )
  editor.insertText(' ')
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="comp"
        props={
          {
            "child": null,
          }
        }
      >
        <component-block-prop
          propPath={
            [
              "child",
            ]
          }
        >
          <paragraph>
            <text>
              ## 
              <cursor />
            </text>
          </paragraph>
        </component-block-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

test('heading enabled in block prop', () => {
  const editor = makeEditorWithChildField(
    fields.child({ kind: 'block', placeholder: '', formatting: { headingLevels: 'inherit' } }),
    <paragraph>
      <text>
        ##
        <cursor />
      </text>
    </paragraph>
  )
  editor.insertText(' ')
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="comp"
        props={
          {
            "child": null,
          }
        }
      >
        <component-block-prop
          propPath={
            [
              "child",
            ]
          }
        >
          <heading
            level={2}
          >
            <text>
              <cursor />
            </text>
          </heading>
        </component-block-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})
