/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import React from 'react'
import { Transforms } from 'slate'
import { jsx, makeEditor } from '../tests/utils'
import { component, fields } from '../../component-blocks'

const qAndA = component({
  preview: props =>
    React.createElement(
      'div',
      null,
      props.fields.children.elements.map(x => {
        return React.createElement(
          'div',
          { key: x.key },
          React.createElement('h1', null, x.fields.question.element),
          React.createElement('p', null, x.fields.answer.element)
        )
      })
    ),
  label: '',
  schema: {
    children: fields.array(
      fields.object({
        question: fields.child({ kind: 'inline', placeholder: 'Question' }),
        answer: fields.child({ kind: 'inline', placeholder: 'Question' }),
      })
    ),
  },
})

// ideally this would probably work like array fields with a single child field in the array
// getting that behaviour right would be difficult though, so this test exists assert
// our current behaviour so we know if it changes for any reason
test('deleting all child fields in an array field element when there are multiple child fields as the element of the array field does not remove the child fields/array element', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="qAndA"
        props={{
          children: [
            { question: null, answer: null },
            { question: null, answer: null },
            { question: null, answer: null },
          ],
        }}
      >
        <component-inline-prop propPath={['children', 0, 'question']}>
          <text>question 1</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 0, 'answer']}>
          <text>
            answer
            <anchor /> 1
          </text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 'question']}>
          <text>question 2</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 'answer']}>
          <text>answer 2</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 2, 'question']}>
          <text>
            question
            <focus /> 3
          </text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 2, 'answer']}>
          <text>answer 3</text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks: { qAndA } }
  )
  Transforms.delete(editor)
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="qAndA"
        props={
          {
            "children": [
              {
                "answer": null,
                "question": null,
              },
              {
                "answer": null,
                "question": null,
              },
              {
                "answer": null,
                "question": null,
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
              "question",
            ]
          }
        >
          <text>
            question 1
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              0,
              "answer",
            ]
          }
        >
          <text>
            answer
            <cursor />
             3
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              1,
              "question",
            ]
          }
        >
          <text />
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              1,
              "answer",
            ]
          }
        >
          <text />
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              2,
              "question",
            ]
          }
        >
          <text />
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              2,
              "answer",
            ]
          }
        >
          <text>
            answer 3
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})

// again, in the future, this might not be the behaviour we want but we want to explicitly state what the behaviour is currently
test('when the wrong children exist, the children are normalized based on the props', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="qAndA"
        props={{
          children: [
            { question: null, answer: null },
            { question: null, answer: null },
            { question: null, answer: null },
          ],
        }}
      >
        <component-inline-prop propPath={['children', 3, 'question']}>
          <text>some question</text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks: { qAndA }, skipRenderingDOM: true, normalization: 'normalize' }
  )
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="qAndA"
        props={
          {
            "children": [
              {
                "answer": null,
                "question": null,
              },
              {
                "answer": null,
                "question": null,
              },
              {
                "answer": null,
                "question": null,
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
              "question",
            ]
          }
        >
          <text />
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              0,
              "answer",
            ]
          }
        >
          <text />
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              1,
              "question",
            ]
          }
        >
          <text />
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              1,
              "answer",
            ]
          }
        >
          <text />
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              2,
              "question",
            ]
          }
        >
          <text />
        </component-inline-prop>
        <component-inline-prop
          propPath={
            [
              "children",
              2,
              "answer",
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
