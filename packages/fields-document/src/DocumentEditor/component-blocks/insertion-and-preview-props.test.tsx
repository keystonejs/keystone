/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { Transforms, Editor } from 'slate';
import React, { ReactElement } from 'react';
import { jsx, makeEditor } from '../tests/utils';
import { component, fields } from '../../component-blocks';
import { createGetPreviewProps } from './preview-props';
import { ChildFieldEditable } from './component-block-render';
import { insertComponentBlock } from '.';

const objectProp = fields.object({
  prop: fields.text({ label: 'Prop' }),
  block: fields.child({ kind: 'block', placeholder: '' }),
  inline: fields.child({ kind: 'inline', placeholder: '' }),
  many: fields.relationship({ label: 'Relationship', listKey: 'many', many: true }),
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
    false: fields.relationship({ label: 'Relationship', listKey: 'one' }),
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
    preview: () => null,
    label: 'Void',
    schema: { text: fields.text({ label: 'Text' }) },
  }),
  complex: component({
    preview: props => {
      return React.createElement(
        'div',
        null,
        props.fields.object.fields.block.element,
        props.fields.object.fields.inline.element,
        props.fields.object.fields.conditional.discriminant &&
          props.fields.object.fields.conditional.value.element
      );
    },
    label: 'Complex',
    schema: {
      object: objectProp,
    },
  }),
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
  insertComponentBlock(editor, componentBlocks, 'void');
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="void"
        props={
          Object {
            "text": "",
          }
        }
      >
        <component-inline-prop>
          <text>
            <cursor />
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
  insertComponentBlock(editor, componentBlocks, 'complex');
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="complex"
        props={
          Object {
            "object": Object {
              "block": null,
              "conditional": Object {
                "discriminant": false,
                "value": null,
              },
              "conditionalSelect": Object {
                "discriminant": "a",
                "value": "",
              },
              "inline": null,
              "many": Array [],
              "prop": "",
              "select": "a",
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

const getPreviewProps = (editor: Editor) =>
  createGetPreviewProps(
    { kind: 'object', fields: componentBlocks.complex.schema },
    props => {
      Transforms.setNodes(editor, { props: props((editor.children[0] as any).props) }, { at: [0] });
    },
    (path): ReactElement => React.createElement(ChildFieldEditable, { path })
  )((editor.children[0] as any).props);

const makeEditorWithComplexComponentBlock = () =>
  makeEditor(
    <editor>
      <component-block
        component="complex"
        props={{
          object: {
            block: null,
            conditional: {
              discriminant: false,
              value: null,
            },
            prop: '',
            select: 'a',
            conditionalSelect: {
              discriminant: 'a',
              value: '',
            },
            inline: null,
            many: [],
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
  const expectedPreviewProps: typeof previewProps = {
    schema: {
      kind: 'object',
      fields: componentBlocks.complex.schema,
    },
    fields: {
      object: {
        schema: componentBlocks.complex.schema.object,
        fields: {
          block: {
            element: React.createElement(ChildFieldEditable, { path: ['object', 'block'] }),
            schema: componentBlocks.complex.schema.object.fields.block,
          },
          conditional: {
            discriminant: false,
            schema: componentBlocks.complex.schema.object.fields.conditional,
            onChange: expect.any(Function),
            options: undefined,
            value: {
              schema: componentBlocks.complex.schema.object.fields.conditional.values.false,
              onChange: expect.any(Function),
              value: null,
            },
          },
          conditionalSelect: {
            discriminant: 'a',
            schema: componentBlocks.complex.schema.object.fields.conditionalSelect,
            onChange: expect.any(Function),
            options: [
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ],
            value: {
              schema: componentBlocks.complex.schema.object.fields.conditionalSelect.values.a,
              onChange: expect.any(Function),
              options: undefined,
              value: '',
            },
          },
          inline: {
            element: React.createElement(ChildFieldEditable, { path: ['object', 'inline'] }),
            schema: componentBlocks.complex.schema.object.fields.inline,
          },
          many: {
            schema: componentBlocks.complex.schema.object.fields.many,
            value: [],
            onChange: expect.any(Function),
          },
          prop: {
            schema: componentBlocks.complex.schema.object.fields.prop,
            onChange: expect.any(Function),
            options: undefined,
            value: '',
          },
          select: {
            schema: componentBlocks.complex.schema.object.fields.select,
            onChange: expect.any(Function),
            options: [
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ],
            value: 'a',
          },
        },
        onChange: expect.any(Function),
      },
    },
    onChange: expect.any(Function),
  };
  expect(previewProps).toEqual(expectedPreviewProps);
});

test('preview props conditional change', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  previewProps.fields.object.fields.conditional.onChange(true);
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="complex"
        props={
          Object {
            "object": Object {
              "block": null,
              "conditional": Object {
                "discriminant": true,
                "value": null,
              },
              "conditionalSelect": Object {
                "discriminant": "a",
                "value": "",
              },
              "inline": null,
              "many": Array [],
              "prop": "",
              "select": "a",
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
  const conditionalPreviewProps = getPreviewProps(editor).fields.object.fields.conditional;
  const expectedConditionalPreviewProps: typeof conditionalPreviewProps = {
    schema: componentBlocks.complex.schema.object.fields.conditional,
    discriminant: true,
    onChange: expect.any(Function),
    options: undefined,
    value: {
      element: React.createElement(ChildFieldEditable, {
        path: ['object', 'conditional', 'value'],
      }),
      schema: componentBlocks.complex.schema.object.fields.conditional.values.true,
    },
  };
  expect(getPreviewProps(editor).fields.object.fields.conditional).toEqual(
    expectedConditionalPreviewProps
  );
});

test('preview props form change', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  previewProps.fields.object.fields.select.onChange('b');
  expect((editor.children[0] as any).props.object.select).toBe('b');
  expect(getPreviewProps(editor).fields.object.fields.select.value).toBe('b');
});

test('relationship many change', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  const val = [{ data: {}, id: 'some-id', label: 'some-id' }];
  previewProps.fields.object.fields.many.onChange(val);
  expect((editor.children[0] as any).props.object.many).toEqual(val);
  expect(getPreviewProps(editor).fields.object.fields.many.value).toEqual(val);
});

function assert(condition: boolean): asserts condition {
  if (!condition) {
    throw new Error('condition is false');
  }
}

test('relationship single change', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  assert(previewProps.fields.object.fields.conditional.discriminant === false);
  const val = { data: {}, id: 'some-id', label: 'some-id' };
  previewProps.fields.object.fields.conditional.value.onChange(val);
  expect((editor.children[0] as any).props.object.conditional.value).toEqual(val);
  expect((getPreviewProps(editor).fields.object.fields.conditional.value as any).value).toEqual(
    val
  );
});

test('changing conditional with form inside', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  assert(previewProps.fields.object.fields.conditional.discriminant === false);
  previewProps.fields.object.fields.conditionalSelect.onChange('b');

  expect((editor.children[0] as any).props.object.conditionalSelect).toMatchInlineSnapshot(`
    Object {
      "discriminant": "b",
      "value": "B",
    }
  `);
  const conditionalSelectPreviewProps =
    getPreviewProps(editor).fields.object.fields.conditionalSelect;
  const expectedConditionalSelectPreviewProps: typeof conditionalSelectPreviewProps = {
    discriminant: 'b',
    schema: componentBlocks.complex.schema.object.fields.conditionalSelect,
    onChange: expect.any(Function),
    options: [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ],
    value: {
      schema: componentBlocks.complex.schema.object.fields.conditionalSelect.values.b,
      onChange: expect.any(Function),
      options: undefined,
      value: 'B',
    },
  };
  expect(getPreviewProps(editor).fields.object.fields.conditionalSelect).toEqual(
    expectedConditionalSelectPreviewProps
  );
});

test('changing form inside conditional', () => {
  let editor = makeEditorWithComplexComponentBlock();

  let previewProps = getPreviewProps(editor);
  previewProps.fields.object.fields.conditionalSelect.value.onChange('Some content');

  expect((editor.children[0] as any).props.object.conditionalSelect).toMatchInlineSnapshot(`
    Object {
      "discriminant": "a",
      "value": "Some content",
    }
  `);
  const conditionalSelectPreviewProps =
    getPreviewProps(editor).fields.object.fields.conditionalSelect;
  const expectedConditionalSelectPreviewProps: typeof conditionalSelectPreviewProps = {
    discriminant: 'a',
    schema: componentBlocks.complex.schema.object.fields.conditionalSelect,
    onChange: expect.any(Function),
    options: [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ],
    value: {
      schema: componentBlocks.complex.schema.object.fields.conditionalSelect.values.a,
      onChange: expect.any(Function),
      options: undefined,
      value: 'Some content',
    },
  };
  expect(conditionalSelectPreviewProps).toEqual(expectedConditionalSelectPreviewProps);
});
