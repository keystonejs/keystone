/** @jsx jsx */
import { component, fields } from '../../component-blocks';
import { insertComponentBlock } from '.';
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
};

test('component-inline-prop and component-block-prop outside of component-block are unwrapped', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <component-inline-prop propPath={undefined as any}>
          <text />
        </component-inline-prop>
      </paragraph>
      <component-block-prop propPath={undefined as any}>
        <paragraph>
          <text />
        </paragraph>
      </component-block-prop>

      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>,
    { normalization: 'normalize' }
  );

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

test('non component block prop in component-block', () => {
  let editor = makeEditor(
    <editor>
      <component-block component={'basic'} relationships={{}} props={{ basic: '' }}>
        <paragraph>
          <text />
        </paragraph>
      </component-block>

      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>,
    { normalization: 'normalize', componentBlocks }
  );

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="basic"
        props={
          Object {
            "basic": "",
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
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

test('content inside of VOID_BUT_NOT_REALLY_INLINE_COMPONENT_PROP', () => {
  let editor = makeEditor(
    <editor>
      <component-block
        component="basic"
        props={{
          basic: '',
        }}
        relationships={{}}
      >
        <component-inline-prop
          propPath={['________VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP________']}
        >
          <text>some text</text>
        </component-inline-prop>
      </component-block>

      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>,
    { normalization: 'normalize', componentBlocks }
  );

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="basic"
        props={
          Object {
            "basic": "",
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
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

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
  insertComponentBlock(editor, componentBlocks, 'basic', {});
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
      <component-block
        component="basic"
        props={
          Object {
            "prop": "",
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

test('extra component props are removed', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text />
      </paragraph>
      <component-block component="withChildElements" props={{ prop: '' }} relationships={{}}>
        <component-block-prop propPath={['block']}>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </component-block-prop>
        <component-block-prop propPath={['block']}>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </component-block-prop>
        <component-inline-prop propPath={['inline']}>
          <text />
        </component-inline-prop>
        <component-inline-prop propPath={['inline']}>
          <text />
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks, normalization: 'normalize' }
  );
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
      <component-block
        component="withChildElements"
        props={
          Object {
            "prop": "",
          }
        }
        relationships={Object {}}
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
              <cursor />
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

test('missing component props are added', () => {
  let editor = makeEditor(
    <editor>
      <component-block component="withChildElements" props={{ prop: '' }} relationships={{}}>
        <component-block-prop propPath={['block']}>
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
    { componentBlocks, normalization: 'normalize' }
  );
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="withChildElements"
        props={
          Object {
            "prop": "",
          }
        }
        relationships={Object {}}
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
              <cursor />
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

test('prop with wrong type for a given prop path', () => {
  let editor = makeEditor(
    <editor>
      <component-block component="withChildElements" props={{ prop: '' }} relationships={{}}>
        <component-inline-prop propPath={['block']}>
          <text>
            some more text
            <cursor />
          </text>
        </component-inline-prop>
        <component-block-prop propPath={['inline']}>
          <text>some text</text>
        </component-block-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks, normalization: 'normalize' }
  );
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="withChildElements"
        props={
          Object {
            "prop": "",
          }
        }
        relationships={Object {}}
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
              some more text
              <cursor />
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
            some text
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
