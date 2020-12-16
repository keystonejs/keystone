/** @jsx jsx */
import { component, fields } from '../../component-blocks';
import { insertComponentBlock } from '.';
import { jsx, makeEditor } from '../tests/utils';
import { Relationships } from '../relationship';

const componentBlocks = {
  complex: component({
    component: () => null,
    label: 'Complex',
    props: {
      object: fields.object({
        prop: fields.text({ label: 'Prop' }),
        block: fields.child({ kind: 'block', placeholder: '' }),
        inline: fields.child({ kind: 'inline', placeholder: '' }),
        many: fields.relationship({ label: 'Relationship', relationship: 'many' }),

        conditional: fields.conditional(fields.checkbox({ label: 'Conditional' }), {
          true: fields.child({ kind: 'block', placeholder: '' }),
          false: fields.relationship({ label: 'Relationship', relationship: 'one' }),
        }),
      }),
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
              "prop": "",
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
