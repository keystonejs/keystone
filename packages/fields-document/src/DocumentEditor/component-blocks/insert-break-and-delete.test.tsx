/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { component, fields } from '../../component-blocks'
import { jsx, makeEditor } from '../tests/utils'

const componentBlocks = {
  basic: component({
    preview: () => null,
    label: 'Basic',
    schema: { prop: fields.text({ label: 'Prop' }) },
  }),
  withChildElements: component({
    preview: () => null,
    label: 'With Child Elements',
    schema: {
      prop: fields.text({ label: 'Prop' }),
      block: fields.child({ kind: 'block', placeholder: '' }),
      inline: fields.child({ kind: 'inline', placeholder: '' }),
    },
  }),
  withChildElementsBlockLast: component({
    preview: () => null,
    label: 'With Child Elements Block last',
    schema: {
      prop: fields.text({ label: 'Prop' }),
      inline: fields.child({ kind: 'inline', placeholder: '' }),
      block: fields.child({ kind: 'block', placeholder: '' }),
    },
  }),
  complex: component({
    preview: () => null,
    label: 'Complex',
    schema: {
      object: fields.object({
        prop: fields.text({ label: 'Prop' }),
        conditional: fields.conditional(fields.checkbox({ label: 'Conditional' }), {
          true: fields.child({ kind: 'block', placeholder: '' }),
          false: fields.relationship({ label: 'Relationship', listKey: 'Something' }),
        }),
      }),
    },
  }),
}

test('delete backward at start', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="withChildElements"
        props={{ prop: '', block: null, inline: null }}
      >
        <component-block-prop propPath={['block']}>
          <paragraph>
            <text>
              <cursor />
              some text
            </text>
          </paragraph>
        </component-block-prop>
        <component-inline-prop propPath={['inline']}>
          <text>some more text</text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks }
  )
  editor.deleteBackward('character')
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          <cursor />
          some text
        </text>
      </paragraph>
      <paragraph>
        <text>
          some more text
        </text>
      </paragraph>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

test('insert break in last (inline) child prop', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="withChildElements"
        props={{ prop: '', block: null, inline: null }}
      >
        <component-block-prop propPath={['block']}>
          <paragraph>
            <text>some text</text>
          </paragraph>
        </component-block-prop>
        <component-inline-prop propPath={['inline']}>
          <text>
            some more
            <cursor /> text
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks }
  )
  editor.insertBreak()
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="withChildElements"
        props={
          {
            "block": null,
            "inline": null,
            "prop": "",
          }
        }
      >
        <component-block-prop
          propPath={
            [
              "block",
            ]
          }
        >
          <paragraph>
            <text>
              some text
            </text>
          </paragraph>
        </component-block-prop>
        <component-inline-prop
          propPath={
            [
              "inline",
            ]
          }
        >
          <text>
            some more
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text>
          <cursor />
           text
        </text>
      </paragraph>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

test('insert break in first (block) child prop in empty paragraph', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="withChildElements"
        props={{ prop: '', block: null, inline: null }}
      >
        <component-block-prop propPath={['block']}>
          <paragraph>
            <text>some text</text>
          </paragraph>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </component-block-prop>
        <component-inline-prop propPath={['inline']}>
          <text>some more text</text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks }
  )
  editor.insertBreak()
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="withChildElements"
        props={
          {
            "block": null,
            "inline": null,
            "prop": "",
          }
        }
      >
        <component-block-prop
          propPath={
            [
              "block",
            ]
          }
        >
          <paragraph>
            <text>
              some text
            </text>
          </paragraph>
        </component-block-prop>
        <component-inline-prop
          propPath={
            [
              "inline",
            ]
          }
        >
          <text>
            <cursor />
            some more text
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

test('insert break in last (block) child prop in empty paragraph', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="withChildElementsBlockLast"
        props={{ prop: '', block: null, inline: null }}
      >
        <component-inline-prop propPath={['inline']}>
          <text>some more text</text>
        </component-inline-prop>
        <component-block-prop propPath={['block']}>
          <paragraph>
            <text>some text</text>
          </paragraph>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </component-block-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks }
  )
  editor.insertBreak()
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="withChildElementsBlockLast"
        props={
          {
            "block": null,
            "inline": null,
            "prop": "",
          }
        }
      >
        <component-inline-prop
          propPath={
            [
              "inline",
            ]
          }
        >
          <text>
            some more text
          </text>
        </component-inline-prop>
        <component-block-prop
          propPath={
            [
              "block",
            ]
          }
        >
          <paragraph>
            <text>
              some text
            </text>
          </paragraph>
        </component-block-prop>
      </component-block>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

test('insert break in first (inline) child prop', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="withChildElementsBlockLast"
        props={{ prop: '', block: null, inline: null }}
      >
        <component-inline-prop propPath={['inline']}>
          <text>
            some more
            <cursor /> text
          </text>
        </component-inline-prop>
        <component-block-prop propPath={['block']}>
          <paragraph>
            <text>some text</text>
          </paragraph>
        </component-block-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks }
  )
  editor.insertBreak()
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="withChildElementsBlockLast"
        props={
          {
            "block": null,
            "inline": null,
            "prop": "",
          }
        }
      >
        <component-inline-prop
          propPath={
            [
              "inline",
            ]
          }
        >
          <text>
            some more
          </text>
        </component-inline-prop>
        <component-block-prop
          propPath={
            [
              "block",
            ]
          }
        >
          <paragraph>
            <text>
              <cursor />
               text
            </text>
          </paragraph>
          <paragraph>
            <text>
              some text
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
