/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import React, { Fragment } from 'react'
import { jsx, makeEditor } from '../tests/utils'
import { component, fields } from '../../component-blocks'
import { createGetPreviewProps } from './preview-props'

const table = component({
  preview: props =>
    React.createElement(
      'div',
      null,
      props.fields.children.elements.map(x => {
        return React.createElement(
          Fragment,
          { key: x.key },
          x.elements.map(x => {
            return React.createElement(Fragment, { key: x.key }, x.fields.content.element)
          })
        )
      })
    ),
  label: '',
  schema: {
    children: fields.array(
      fields.array(
        fields.object({
          content: fields.child({ kind: 'inline', placeholder: '' }),
          something: fields.text({ label: '' }),
        })
      )
    ),
  },
})

test('child field in nested array', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="table"
        props={{
          children: [[{ content: null, something: '1' }]],
        }}
      >
        <component-inline-prop propPath={['children', 0, 0, 'content']}>
          <text>first</text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    {
      componentBlocks: {
        table,
      },
    }
  )
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="table"
        props={
          {
            "children": [
              [
                {
                  "content": null,
                  "something": "1",
                },
              ],
            ],
          }
        }
      >
        <component-inline-prop
          propPath={
            [
              "children",
              0,
              0,
              "content",
            ]
          }
        >
          <text>
            first
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

test('multiple in child field in nested array', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="table"
        props={{
          children: [
            [
              { content: null, something: '1' },
              { content: null, something: '2' },
            ],
            [
              { content: null, something: '3' },
              { content: null, something: '4' },
            ],
          ],
        }}
      >
        <component-inline-prop propPath={['children', 0, 0, 'content']}>
          <text>first</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 0, 1, 'content']}>
          <text>second</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 0, 'content']}>
          <text>third</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 1, 'content']}>
          <text>fourth</text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    {
      componentBlocks: {
        table,
      },
    }
  )
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="table"
        props={
          {
            "children": [
              [
                {
                  "content": null,
                  "something": "1",
                },
                {
                  "content": null,
                  "something": "2",
                },
              ],
              [
                {
                  "content": null,
                  "something": "3",
                },
                {
                  "content": null,
                  "something": "4",
                },
              ],
            ],
          }
        }
      >
        <component-inline-prop
          propPath={
            [
              "children",
              0,
              0,
              "content",
            ]
          }
        >
          <text>
            first
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              0,
              1,
              "content",
            ]
          }
        >
          <text>
            second
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              1,
              0,
              "content",
            ]
          }
        >
          <text>
            third
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              1,
              1,
              "content",
            ]
          }
        >
          <text>
            fourth
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

test('add to multiple in child field in nested array', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="table"
        props={{
          children: [
            [
              { content: null, something: '1' },
              { content: null, something: '2' },
            ],
            [
              { content: null, something: '3' },
              { content: null, something: '4' },
            ],
          ],
        }}
      >
        <component-inline-prop propPath={['children', 0, 0, 'content']}>
          <text>first</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 0, 1, 'content']}>
          <text>second</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 0, 'content']}>
          <text>third</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 1, 'content']}>
          <text>fourth</text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    {
      componentBlocks: {
        table,
      },
    }
  )
  const previewProps = createGetPreviewProps(
    { kind: 'object', fields: table.schema },
    () => {},
    () => undefined
  )((editor.children[0] as any).props)

  previewProps.fields.children.elements[0].onChange([
    ...previewProps.fields.children.elements[0].elements.map(x => ({ key: x.key })),
    { key: undefined },
  ])
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="table"
        props={
          {
            "children": [
              [
                {
                  "content": null,
                  "something": "1",
                },
                {
                  "content": null,
                  "something": "2",
                },
              ],
              [
                {
                  "content": null,
                  "something": "3",
                },
                {
                  "content": null,
                  "something": "4",
                },
              ],
            ],
          }
        }
      >
        <component-inline-prop
          propPath={
            [
              "children",
              0,
              0,
              "content",
            ]
          }
        >
          <text>
            first
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              0,
              1,
              "content",
            ]
          }
        >
          <text>
            second
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              1,
              0,
              "content",
            ]
          }
        >
          <text>
            third
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              1,
              1,
              "content",
            ]
          }
        >
          <text>
            fourth
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})
