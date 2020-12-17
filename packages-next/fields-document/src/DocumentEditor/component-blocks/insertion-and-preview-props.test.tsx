/** @jsx jsx */
import { component, fields } from '../../component-blocks';
import { insertComponentBlock } from '.';
import { jsx, makeEditor } from '../tests/utils';
import { Relationships } from '../relationship';
import { createPreviewProps } from './preview-props';
import { Transforms, Element, Editor } from 'slate';
import React from 'react';
import { ExtractPropFromComponentPropFieldForPreview } from './api';

const objectProp = fields.object({
  prop: fields.text({ label: 'Prop' }),
  block: fields.child({ kind: 'block', placeholder: '' }),
  inline: fields.child({ kind: 'inline', placeholder: '' }),
  many: fields.relationship<'many'>({ label: 'Relationship', relationship: 'many' }),
  select: fields.select({
    label: 'Select',
    defaultValue: 'a',
    options: [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ],
  }),
  conditional: fields.conditional(fields.checkbox({ label: 'Conditional' }), {
    true: fields.child({ kind: 'block', placeholder: '' }),
    false: fields.relationship<'one'>({ label: 'Relationship', relationship: 'one' }),
  }),
  conditionalSelect: fields.conditional(
    fields.select({
      label: 'Conditional Select',
      defaultValue: 'a',
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ],
    } as const),
    {
      a: fields.text({ label: 'A in Conditional Select' }),
      b: fields.text({ label: 'B in Conditional Select', defaultValue: 'B' }),
    }
  ),
});

const componentBlocks = {
  void: component({
    component: () => null,
    label: 'Void',
    props: { text: fields.text({ label: 'Text' }) },
  }),
  complex: component({
    component: () => null,
    label: 'Complex',
    props: {
      object: objectProp,
    },
  }),
};

const relationships: Relationships = {
  one: {
    kind: 'prop',
    many: false,
    labelField: 'label',
    listKey: 'User',
    selection: null,
  },
  many: {
    kind: 'prop',
    many: true,
    labelField: 'label',
    listKey: 'User',
    selection: null,
  },
};

test('inserting a void component block', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>,
    { componentBlocks }
  );
  insertComponentBlock(editor, componentBlocks, 'void', relationships);
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
      <component-block
        component="void"
        props={
          Object {
            "text": "",
          }
        }
        relationships={Object {}}
      >
        <component-inline-prop
          propPath={
            Array [
              "________VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP________",
            ]
          }
        >
          <text>
            
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

test('inserting a complex component block', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>,
    { componentBlocks }
  );
  insertComponentBlock(editor, componentBlocks, 'complex', relationships);
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
      <component-block
        component="complex"
        props={
          Object {
            "object": Object {
              "conditional": Object {
                "discriminant": false,
              },
              "conditionalSelect": Object {
                "discriminant": "a",
                "value": "",
              },
              "prop": "",
              "select": "a",
            },
          }
        }
        relationships={
          Object {
            "[\\"object\\",\\"conditional\\",\\"value\\"]": Object {
              "data": null,
              "relationship": "one",
            },
            "[\\"object\\",\\"many\\"]": Object {
              "data": Array [],
              "relationship": "many",
            },
          }
        }
      >
        <component-block-prop
          propPath={
            Array [
              "object",
              "block",
            ]
          }
        >
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </component-block-prop>
        <component-inline-prop
          propPath={
            Array [
              "object",
              "inline",
            ]
          }
        >
          <text>
            
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

const getPreviewProps = (
  editor: Editor
): {
  object: ExtractPropFromComponentPropFieldForPreview<typeof objectProp>;
} =>
  createPreviewProps(
    editor.children[0] as Element,
    componentBlocks.complex,
    {
      '["object","block"]': React.createElement('block-prop'),
      '["object","inline"]': React.createElement('inline-prop'),
      '["object","conditional","value"]': React.createElement('conditional-prop'),
    },
    relationships,
    data => {
      Transforms.setNodes(editor, data, { at: [0] });
    }
  ) as any;

const makeEditorWithComplexComponentBlock = () =>
  makeEditor(
    <editor>
      <component-block
        component="complex"
        props={{
          object: {
            conditional: {
              discriminant: false,
            },
            prop: '',
            select: 'a',
            conditionalSelect: {
              discriminant: 'a',
              value: '',
            },
          },
        }}
        relationships={{
          '["object","conditional","value"]': {
            data: null,
            relationship: 'one',
          },
          '["object","many"]': {
            data: [],
            relationship: 'many',
          },
        }}
      >
        <component-block-prop propPath={['object', 'block']}>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </component-block-prop>
        <component-inline-prop propPath={['object', 'inline']}>
          <text />
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks }
  );

test('preview props api', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  expect(previewProps).toMatchInlineSnapshot(`
    Object {
      "object": Object {
        "block": <block-prop />,
        "conditional": Object {
          "discriminant": false,
          "onChange": [Function],
          "options": undefined,
          "value": Object {
            "onChange": [Function],
            "value": null,
          },
        },
        "conditionalSelect": Object {
          "discriminant": "a",
          "onChange": [Function],
          "options": Array [
            Object {
              "label": "A",
              "value": "a",
            },
            Object {
              "label": "B",
              "value": "b",
            },
          ],
          "value": Object {
            "onChange": [Function],
            "options": undefined,
            "value": "",
          },
        },
        "inline": <inline-prop />,
        "many": Object {
          "onChange": [Function],
          "value": Array [],
        },
        "prop": Object {
          "onChange": [Function],
          "options": undefined,
          "value": "",
        },
        "select": Object {
          "onChange": [Function],
          "options": Array [
            Object {
              "label": "A",
              "value": "a",
            },
            Object {
              "label": "B",
              "value": "b",
            },
          ],
          "value": "a",
        },
      },
    }
  `);
});

test('preview props conditional change', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  previewProps.object.conditional.onChange(true);
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="complex"
        props={
          Object {
            "object": Object {
              "conditional": Object {
                "discriminant": true,
                "value": undefined,
              },
              "conditionalSelect": Object {
                "discriminant": "a",
                "value": "",
              },
              "prop": "",
              "select": "a",
            },
          }
        }
        relationships={
          Object {
            "[\\"object\\",\\"many\\"]": Object {
              "data": Array [],
              "relationship": "many",
            },
          }
        }
      >
        <component-block-prop
          propPath={
            Array [
              "object",
              "block",
            ]
          }
        >
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </component-block-prop>
        <component-inline-prop
          propPath={
            Array [
              "object",
              "inline",
            ]
          }
        >
          <text>
            
          </text>
        </component-inline-prop>
        <component-block-prop
          propPath={
            Array [
              "object",
              "conditional",
              "value",
            ]
          }
        >
          <paragraph>
            <text>
              
            </text>
          </paragraph>
        </component-block-prop>
      </component-block>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
  expect(getPreviewProps(editor).object.conditional).toMatchInlineSnapshot(`
    Object {
      "discriminant": true,
      "onChange": [Function],
      "options": undefined,
      "value": <conditional-prop />,
    }
  `);
});

test('preview props form change', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  previewProps.object.select.onChange('b');
  expect((editor.children[0].props as any).object.select).toBe('b');
  expect(getPreviewProps(editor).object.select.value).toBe('b');
});

test('relationship many change', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  previewProps.object.many.onChange([{ data: {}, id: 'some-id', label: 'some-id' }]);
  expect(editor.children[0].relationships).toMatchInlineSnapshot(`
    Object {
      "[\\"object\\",\\"conditional\\",\\"value\\"]": Object {
        "data": null,
        "relationship": "one",
      },
      "[\\"object\\",\\"many\\"]": Object {
        "data": Array [
          Object {
            "data": Object {},
            "id": "some-id",
            "label": "some-id",
          },
        ],
        "relationship": "many",
      },
    }
  `);
  expect(getPreviewProps(editor).object.many.value).toEqual([
    { data: {}, id: 'some-id', label: 'some-id' },
  ]);
});

function assert(condition: boolean): asserts condition {
  if (!condition) {
    throw new Error('condition is false');
  }
}

test('relationship single change', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  assert(previewProps.object.conditional.discriminant === false);
  previewProps.object.conditional.value.onChange({ data: {}, id: 'some-id', label: 'some-id' });
  expect(editor.children[0].relationships).toMatchInlineSnapshot(`
    Object {
      "[\\"object\\",\\"conditional\\",\\"value\\"]": Object {
        "data": Object {
          "data": Object {},
          "id": "some-id",
          "label": "some-id",
        },
        "relationship": "one",
      },
      "[\\"object\\",\\"many\\"]": Object {
        "data": Array [],
        "relationship": "many",
      },
    }
  `);
  expect(getPreviewProps(editor).object.conditional).toMatchInlineSnapshot(`
    Object {
      "discriminant": false,
      "onChange": [Function],
      "options": undefined,
      "value": Object {
        "onChange": [Function],
        "value": Object {
          "data": Object {},
          "id": "some-id",
          "label": "some-id",
        },
      },
    }
  `);
});

test('changing conditional with form inside', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  assert(previewProps.object.conditional.discriminant === false);
  previewProps.object.conditionalSelect.onChange('b');

  expect((editor.children[0].props as any).object.conditionalSelect).toMatchInlineSnapshot(`
    Object {
      "discriminant": "b",
      "value": "B",
    }
  `);
  expect(getPreviewProps(editor).object.conditionalSelect).toMatchInlineSnapshot(`
    Object {
      "discriminant": "b",
      "onChange": [Function],
      "options": Array [
        Object {
          "label": "A",
          "value": "a",
        },
        Object {
          "label": "B",
          "value": "b",
        },
      ],
      "value": Object {
        "onChange": [Function],
        "options": undefined,
        "value": "B",
      },
    }
  `);
});

test('changing form inside conditional', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  assert(previewProps.object.conditional.discriminant === false);
  previewProps.object.conditionalSelect.value.onChange('Some content');

  expect((editor.children[0].props as any).object.conditionalSelect).toMatchInlineSnapshot(`
    Object {
      "discriminant": "a",
      "value": "Some content",
    }
  `);
  expect(getPreviewProps(editor).object.conditionalSelect).toMatchInlineSnapshot(`
    Object {
      "discriminant": "a",
      "onChange": [Function],
      "options": Array [
        Object {
          "label": "A",
          "value": "a",
        },
        Object {
          "label": "B",
          "value": "b",
        },
      ],
      "value": Object {
        "onChange": [Function],
        "options": undefined,
        "value": "Some content",
      },
    }
  `);
});
