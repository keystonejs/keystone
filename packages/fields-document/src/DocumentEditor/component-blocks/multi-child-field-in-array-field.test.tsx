/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import React from 'react';
import { Editor, Transforms } from 'slate';
import { jsx, makeEditor } from '../tests/utils';
import { component, fields } from '../../component-blocks';

const qAndA = component({
  component: props =>
    React.createElement(
      'div',
      null,
      props.fields.children.elements.map(x => {
        return React.createElement(
          'div',
          { key: x.id },
          React.createElement('h1', null, x.element.fields.question),
          React.createElement('p', null, x.element.fields.answer)
        );
      })
    ),
  label: '',
  props: {
    children: fields.array(
      fields.object({
        question: fields.child({ kind: 'inline', placeholder: 'Question' }),
        answer: fields.child({ kind: 'inline', placeholder: 'Question' }),
      })
    ),
  },
});

test('deleting all child fields in an array element removes the element', () => {
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
            answer 1<anchor />
          </text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 'question']}>
          <text>question 2</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 'answer']}>
          <text>
            answer 2<focus />
          </text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 2, 'question']}>
          <text>question 3</text>
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
  );
  Editor.withoutNormalizing(editor, () => {
    Transforms.delete(editor);
    expect(editor).toMatchInlineSnapshot(`
      <editor>
        <component-block
          component="qAndA"
          props={
            Object {
              "children": Array [
                Object {
                  "answer": null,
                  "question": null,
                },
                Object {
                  "answer": null,
                  "question": null,
                },
                Object {
                  "answer": null,
                  "question": null,
                },
              ],
            }
          }
        >
          <component-inline-prop
            propPath={
              Array [
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
              Array [
                "children",
                0,
                "answer",
              ]
            }
          >
            <text>
              answer 1
            </text>
            <text>
              <cursor />
            </text>
          </component-inline-prop>
          <component-inline-prop
            propPath={
              Array [
                "children",
                2,
                "question",
              ]
            }
          >
            <text>
              question 3
            </text>
          </component-inline-prop>
          <component-inline-prop
            propPath={
              Array [
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
          <text>
            
          </text>
        </paragraph>
      </editor>
    `);
  });
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="qAndA"
        props={
          Object {
            "children": Array [
              Object {
                "answer": null,
                "question": null,
              },
              Object {
                "answer": null,
                "question": null,
              },
              Object {
                "answer": null,
                "question": null,
              },
            ],
          }
        }
      >
        <component-inline-prop
          propPath={
            Array [
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
            Array [
              "children",
              0,
              "answer",
            ]
          }
        >
          <text>
            answer 1
            <cursor />
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            Array [
              "children",
              1,
              "question",
            ]
          }
        >
          <text>
            
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            Array [
              "children",
              1,
              "answer",
            ]
          }
        >
          <text>
            
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            Array [
              "children",
              2,
              "question",
            ]
          }
        >
          <text>
            question 3
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            Array [
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
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});
