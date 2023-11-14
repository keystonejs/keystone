/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import React from 'react'
import { Transforms } from 'slate'
import { jsx, makeEditor } from '../tests/utils'
import { component, fields } from '../../component-blocks'

const list = component({
  preview: props =>
    React.createElement(
      'ul',
      null,
      props.fields.children.elements.map((x, i) => {
        return React.createElement(
          'li',
          { key: x.key },
          x.fields.content.element,
          React.createElement(
            'button',
            {
              'data-remove': i,
              onClick: () =>
                props.onChange({
                  children: props.fields.children.elements
                    .filter(element => element.key !== x.key)
                    .map(x => ({ key: x.key })),
                }),
            },
            'Remove'
          )
        )
      }),
      React.createElement(
        'button',
        {
          'data-insert': true,
          onClick: () =>
            props.fields.children.onChange([
              ...props.fields.children.elements.map(x => ({ key: x.key })),
              { key: undefined },
            ]),
        },
        'Insert'
      )
    ),
  label: '',
  schema: {
    children: fields.array(
      fields.object({
        content: fields.child({ kind: 'inline', placeholder: '' }),
        done: fields.checkbox({ label: '' }),
      })
    ),
  },
})

test('child field in nested array', () => {
  makeEditor(
    <editor>
      <component-block
        component="list"
        props={{
          children: [{ content: null, done: false }],
        }}
      >
        <component-inline-prop propPath={['children', 0, 'content']}>
          <text>first</text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks: { list } }
  )
})

test('inserting a break at the end of a child field creates a new item with fresh values', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="list"
        props={{
          children: [{ content: null, done: true }],
        }}
      >
        <component-inline-prop propPath={['children', 0, 'content']}>
          <text>
            first
            <cursor />
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks: { list } }
  )
  editor.insertBreak()
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="list"
        props={
          {
            "children": [
              {
                "content": null,
                "done": true,
              },
              {
                "content": null,
                "done": false,
              },
            ],
          }
        }
      >
        <component-inline-prop
          propPath={
            [
              "children",
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
              1,
              "content",
            ]
          }
        >
          <text>
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

test('inserting a break splits the text and uses the values from the first entry', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="list"
        props={{
          children: [{ content: null, done: true }],
        }}
      >
        <component-inline-prop propPath={['children', 0, 'content']}>
          <text>
            some
            <cursor />
            text
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks: { list } }
  )
  editor.insertBreak()
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="list"
        props={
          {
            "children": [
              {
                "content": null,
                "done": true,
              },
              {
                "content": null,
                "done": true,
              },
            ],
          }
        }
      >
        <component-inline-prop
          propPath={
            [
              "children",
              0,
              "content",
            ]
          }
        >
          <text>
            some
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              1,
              "content",
            ]
          }
        >
          <text>
            <cursor />
            text
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

test('inserting a break in an empty child removes the element and inserts a paragraph', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="list"
        props={{
          children: [
            { content: null, done: true },
            { content: null, done: false },
          ],
        }}
      >
        <component-inline-prop propPath={['children', 0, 'content']}>
          <text>some text</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 'content']}>
          <text>
            <cursor />
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks: { list } }
  )
  editor.insertBreak()
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="list"
        props={
          {
            "children": [
              {
                "content": null,
                "done": true,
              },
            ],
          }
        }
      >
        <component-inline-prop
          propPath={
            [
              "children",
              0,
              "content",
            ]
          }
        >
          <text>
            some text
          </text>
        </component-inline-prop>
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

test('deleting a range of nodes removes them', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="list"
        props={{
          children: [
            { content: null, done: true },
            { content: null, done: false },
            { content: null, done: true },
            { content: null, done: false },
            { content: null, done: true },
            { content: null, done: false },
          ],
        }}
      >
        <component-inline-prop propPath={['children', 0, 'content']}>
          <text>0</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 'content']}>
          <text>
            <anchor />1
          </text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 2, 'content']}>
          <text>2</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 3, 'content']}>
          <text>3</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 4, 'content']}>
          <text>
            4<focus />
          </text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 5, 'content']}>
          <text>5</text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks: { list } }
  )
  Transforms.delete(editor)
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="list"
        props={
          {
            "children": [
              {
                "content": null,
                "done": true,
              },
              {
                "content": null,
                "done": true,
              },
              {
                "content": null,
                "done": false,
              },
            ],
          }
        }
      >
        <component-inline-prop
          propPath={
            [
              "children",
              0,
              "content",
            ]
          }
        >
          <text>
            0
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              1,
              "content",
            ]
          }
        >
          <text>
            <cursor />
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              2,
              "content",
            ]
          }
        >
          <text>
            5
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

test('inserting an item from empty works', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="list"
        props={{
          children: [],
        }}
      >
        <component-inline-prop>
          <text />
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks: { list } }
  );
  (editor.container!.querySelector('button[data-insert]') as HTMLButtonElement).click()
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="list"
        props={
          {
            "children": [
              {
                "content": null,
                "done": false,
              },
            ],
          }
        }
      >
        <component-inline-prop
          propPath={
            [
              "children",
              0,
              "content",
            ]
          }
        >
          <text />
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

test('removing an item using the preview props works', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="list"
        props={{
          children: [{ content: null, done: false }],
        }}
      >
        <component-inline-prop propPath={['children', 0, 'content']}>
          <text>something</text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks: { list } }
  );
  (editor.container!.querySelector('button[data-remove]') as HTMLButtonElement).click()
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="list"
        props={
          {
            "children": [],
          }
        }
      >
        <component-inline-prop>
          <text />
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})
