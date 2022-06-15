/** @jsxRuntime classic */
/** @jsx jsx */
import { component, ComponentBlock, fields } from './DocumentEditor/component-blocks/api';
import { Relationships } from './DocumentEditor/relationship';
import { defaultDocumentFeatures, makeEditor, jsx } from './DocumentEditor/tests/utils';
import { PropValidationError, validateAndNormalizeDocument } from './validation';

// note this is just about ensuring things fail validation
// we already test that the correct input succeeds on validation in all of the other tests
// because the test utils run validation

const relationships: Relationships = {
  inline: {
    label: 'Inline',
    listKey: 'Post',
    selection: `something`,
  },
};

const componentBlocks: Record<string, ComponentBlock> = {
  basic: component({
    component: () => null,
    label: '',
    props: { prop: fields.text({ label: '' }) },
  }),
  relationship: component({
    component: () => null,
    label: '',
    props: {
      one: fields.relationship({ label: '', listKey: 'Post', selection: 'something' }),
      many: fields.relationship({ label: '', listKey: 'Post', many: true, selection: 'something' }),
    },
  }),
  object: component({
    component: () => null,
    label: '',
    props: {
      prop: fields.object({
        prop: fields.text({ label: '' }),
      }),
    },
  }),
  conditional: component({
    component: () => null,
    label: '',
    props: {
      prop: fields.conditional(fields.checkbox({ label: '' }), {
        true: fields.text({ label: '' }),
        false: fields.child({ kind: 'inline', placeholder: '' }),
      }),
    },
  }),
};

const validate = (val: unknown) => {
  try {
    const node = validateAndNormalizeDocument(
      val,
      defaultDocumentFeatures,
      componentBlocks,
      relationships
    );
    return makeEditor(<editor>{node}</editor>, {
      componentBlocks,
      relationships,
      skipRenderingDOM: true,
    });
  } catch (err) {
    return err;
  }
};

expect.addSnapshotSerializer({
  test(val) {
    return val instanceof PropValidationError;
  },
  serialize(val) {
    return `PropValidationError ${JSON.stringify(val.message)} ${JSON.stringify(val.path)}`;
  },
});

test('invalid structure', () => {
  expect(validate({})).toMatchInlineSnapshot(`[Error: Invalid document structure]`);
});

test('bad link', () => {
  expect(
    validate([
      {
        type: 'paragraph',
        children: [
          { type: 'link', href: 'javascript:doBadThings()', children: [{ text: 'some text' }] },
        ],
      },
    ])
  ).toMatchInlineSnapshot(`[Error: Invalid document structure]`);
});

test('excess properties', () => {
  expect(
    validate([
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            somethingElse: true,
            href: 'https://keystonejs.com',
            children: [{ text: 'something' }],
          },
        ],
      },
    ])
  ).toMatchInlineSnapshot(`[Error: Invalid document structure]`);
});

test('relationships that do not exist in the allowed relationships are normalized away', () => {
  expect(
    validate([
      {
        type: 'paragraph',
        children: [
          { text: 'something' },
          {
            type: 'relationship',
            relationship: 'doesNotExist',
            data: { id: 'an-id' },
            children: [{ text: '' }],
          },
          { text: 'something' },
        ],
      },
    ])
  ).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          somethingan-id (doesNotExist:an-id)something
        </text>
      </paragraph>
    </editor>
  `);
});

test('inline relationships not of kind inline are normalized away', () => {
  expect(
    validate([
      {
        type: 'paragraph',
        children: [
          { text: 'something' },
          {
            type: 'relationship',
            relationship: 'many',
            data: { id: 'an-id' },
            children: [{ text: '' }],
          },
          { text: 'something' },
        ],
      },
    ])
  ).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          somethingan-id (many:an-id)something
        </text>
      </paragraph>
    </editor>
  `);
});

test('label and data in inline relationships are stripped', () => {
  expect(
    validate([
      {
        type: 'paragraph',
        children: [
          { text: 'something' },
          {
            type: 'relationship',
            relationship: 'inline',
            data: { id: 'an-id', label: 'something', data: { wow: true } },
            children: [{ text: '' }],
          },
          { text: 'something' },
        ],
      },
    ])
  ).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          something
        </text>
        <relationship
          @@isInline={true}
          @@isVoid={true}
          data={
            Object {
              "data": undefined,
              "id": "an-id",
              "label": undefined,
            }
          }
          relationship="inline"
        >
          <text>
            
          </text>
        </relationship>
        <text>
          something
        </text>
      </paragraph>
    </editor>
  `);
});

test('label and data in relationship props are stripped', () => {
  expect(
    validate([
      {
        type: 'component-block',
        props: {
          one: { id: 'some-id', label: 'some label', data: { something: true } },
          many: [
            { id: 'some-id', label: 'some label', data: { something: true } },
            { id: 'another-id', label: 'another label', data: { something: false } },
          ],
        },
        component: 'relationship',
        children: [],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
  ).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="relationship"
        props={
          Object {
            "many": Array [
              Object {
                "id": "some-id",
              },
              Object {
                "id": "another-id",
              },
            ],
            "one": Object {
              "id": "some-id",
            },
          }
        }
      >
        <component-inline-prop>
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

test('array in to-one relationship', () => {
  expect(
    validate([
      {
        type: 'component-block',
        props: {
          one: [],
          many: [
            { id: 'some-id', label: 'some label', data: { something: true } },
            { id: 'another-id', label: 'another label', data: { something: false } },
          ],
        },
        component: 'relationship',
        children: [],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
  ).toMatchInlineSnapshot(`PropValidationError "Invalid relationship value" ["one"]`);
});

test('single item in many relationship', () => {
  expect(
    validate([
      {
        type: 'component-block',
        props: {
          one: null,
          many: { id: 'some-id', label: 'some label', data: { something: true } },
        },
        component: 'relationship',
        children: [],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
  ).toMatchInlineSnapshot(`PropValidationError "Invalid relationship value" ["many"]`);
});

test('missing relationships', () => {
  expect(
    validate([
      {
        type: 'component-block',
        props: {},
        component: 'relationship',
        children: [],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
  ).toMatchInlineSnapshot(`PropValidationError "Invalid relationship value" ["one"]`);
});

test('excess prop', () => {
  expect(
    validate([
      {
        type: 'component-block',
        props: { something: true, prop: '' },
        component: 'basic',
        children: [],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
  ).toMatchInlineSnapshot(
    `PropValidationError "Key on object value \\"something\\" is not allowed" []`
  );
});

test('form prop validation', () => {
  expect(
    validate([
      {
        type: 'component-block',
        props: { prop: {} },
        component: 'basic',
        children: [],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
  ).toMatchInlineSnapshot(`PropValidationError "Invalid form prop value" ["prop"]`);
});

test('object prop of wrong type', () => {
  expect(
    validate([
      {
        type: 'component-block',
        props: { prop: false },
        component: 'object',
        children: [],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
  ).toMatchInlineSnapshot(`PropValidationError "Object value must be an object" ["prop"]`);
});

test('form prop failure inside of object', () => {
  expect(
    validate([
      {
        type: 'component-block',
        props: { prop: { prop: false } },
        component: 'object',
        children: [],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
  ).toMatchInlineSnapshot(`PropValidationError "Invalid form prop value" ["prop","prop"]`);
});

test('non-object value in conditional prop', () => {
  expect(
    validate([
      {
        type: 'component-block',
        props: { prop: '' },
        component: 'conditional',
        children: [],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
  ).toMatchInlineSnapshot(`PropValidationError "Conditional value must be an object" ["prop"]`);
});

test('excess prop in conditional object', () => {
  expect(
    validate([
      {
        type: 'component-block',
        props: { prop: { discriminant: false, excess: true } },
        component: 'conditional',
        children: [],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
  ).toMatchInlineSnapshot(
    `PropValidationError "Conditional value only allows keys named \\"discriminant\\" and \\"value\\", not \\"excess\\"" ["prop"]`
  );
});

test('validation failure on discriminant', () => {
  expect(
    validate([
      {
        type: 'component-block',
        props: { prop: { discriminant: '' } },
        component: 'conditional',
        children: [],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
  ).toMatchInlineSnapshot(`PropValidationError "Invalid form prop value" ["prop","discriminant"]`);
});

test('validation failure on value', () => {
  expect(
    validate([
      {
        type: 'component-block',
        props: { prop: { discriminant: true, value: false } },
        component: 'conditional',
        children: [],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
  ).toMatchInlineSnapshot(`PropValidationError "Invalid form prop value" ["prop","value"]`);
});
