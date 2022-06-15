/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { component, fields } from '../../component-blocks';
import { jsx, makeEditor } from '../tests/utils';

const componentBlocks = {
  basic: component({
    component: () => null,
    label: 'Basic',
    props: { prop: fields.text({ label: 'Prop' }) },
  }),
  withChildElements: component({
    component: () => null,
    label: 'With Child Elements',
    props: {
      prop: fields.text({ label: 'Prop' }),
      block: fields.child({ kind: 'block', placeholder: '' }),
      inline: fields.child({ kind: 'inline', placeholder: '' }),
    },
  }),
  withChildElementsBlockLast: component({
    component: () => null,
    label: 'With Child Elements Block last',
    props: {
      prop: fields.text({ label: 'Prop' }),
      inline: fields.child({ kind: 'inline', placeholder: '' }),
      block: fields.child({ kind: 'block', placeholder: '' }),
    },
  }),
  complex: component({
    component: () => null,
    label: 'Complex',
    props: {
      object: fields.object({
        prop: fields.text({ label: 'Prop' }),
        conditional: fields.conditional(fields.checkbox({ label: 'Conditional' }), {
          true: fields.child({ kind: 'block', placeholder: '' }),
          false: fields.relationship({ label: 'Relationship', listKey: 'Something' }),
        }),
      }),
    },
  }),
};

test('delete backward at start', () => {
  let editor = makeEditor(
    <editor>
      <component-block component="withChildElements" props={{ prop: '' }}>
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
  );
  editor.deleteBackward('character');
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
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('insert break in last (inline) child prop', () => {
  let editor = makeEditor(
    <editor>
      <component-block component="withChildElements" props={{ prop: '' }}>
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
  );
  editor.insertBreak();
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="withChildElements"
        props={
          Object {
            "prop": "",
          }
        }
      >
        <component-block-prop
          propPath={
            Array [
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
            Array [
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
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('insert break in first (block) child prop in empty paragraph', () => {
  let editor = makeEditor(
    <editor>
      <component-block component="withChildElements" props={{ prop: '' }}>
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
  );
  editor.insertBreak();
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="withChildElements"
        props={
          Object {
            "prop": "",
          }
        }
      >
        <component-block-prop
          propPath={
            Array [
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
            Array [
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
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('insert break in last (block) child prop in empty paragraph', () => {
  let editor = makeEditor(
    <editor>
      <component-block component="withChildElementsBlockLast" props={{ prop: '' }}>
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
  );
  editor.insertBreak();
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="withChildElementsBlockLast"
        props={
          Object {
            "prop": "",
          }
        }
      >
        <component-inline-prop
          propPath={
            Array [
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
            Array [
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
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('insert break in first (inline) child prop', () => {
  let editor = makeEditor(
    <editor>
      <component-block component="withChildElementsBlockLast" props={{ prop: '' }}>
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
  );
  editor.insertBreak();
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="withChildElementsBlockLast"
        props={
          Object {
            "prop": "",
          }
        }
      >
        <component-inline-prop
          propPath={
            Array [
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
            Array [
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
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});
