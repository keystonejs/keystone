/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { Transforms } from 'slate';
import { component, fields } from '../../component-blocks';
import { jsx, makeEditor } from '../tests/utils';
import { insertComponentBlock } from '.';

const componentBlocks = {
  basic: component({
    preview: () => null,
    label: 'Basic',
    schema: { prop: fields.text({ label: 'Prop' }) },
  }),
  withChildElements: component({
    preview: () => null,
    label: 'With Child Elements',
    schema: {
      prop: fields.text({ label: 'Prop' }),
      block: fields.child({ kind: 'block', placeholder: '' }),
      inline: fields.child({ kind: 'inline', placeholder: '' }),
    },
  }),
  withLotsOfChildElements: component({
    preview: () => null,
    label: 'With Lots of Child Elements',
    schema: {
      block: fields.child({ kind: 'block', placeholder: '' }),
      inline: fields.child({ kind: 'inline', placeholder: '' }),
      last: fields.child({ kind: 'block', placeholder: '' }),
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
      <component-block component={'basic'} props={{ prop: '' }}>
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
            "prop": "",
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
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

test('content inside of void child prop', () => {
  let editor = makeEditor(
    <editor>
      <component-block
        component="basic"
        props={{
          prop: '',
        }}
      >
        <component-inline-prop>
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
            "prop": "",
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
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

test('prop path for old fake void prop is removed', () => {
  let editor = makeEditor(
    <editor>
      <component-block
        component="basic"
        props={{
          prop: '',
        }}
      >
        <component-inline-prop
          propPath={['________VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP________']}
        >
          <text />
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
            "prop": "",
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
  insertComponentBlock(editor, componentBlocks, 'basic');
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="basic"
        props={
          Object {
            "prop": "",
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

test('extra component props are removed', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text />
      </paragraph>
      <component-block
        component="withChildElements"
        props={{ prop: '', block: null, inline: null }}
      >
        <component-block-prop propPath={['block']}>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </component-block-prop>
        <component-block-prop propPath={['block']}>
          <paragraph>
            <text />
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
            "block": null,
            "inline": null,
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
      <component-block component="withChildElements" props={{ prop: '', block: null }}>
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
            "block": null,
            "inline": null,
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
      <component-block component="withChildElements" props={{ prop: '' }}>
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
            "block": null,
            "inline": null,
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

test('props in wrong order', () => {
  let editor = makeEditor(
    <editor>
      <component-block
        component="withLotsOfChildElements"
        props={{ last: null, block: null, inline: null }}
      >
        <component-block-prop propPath={['last']}>
          <paragraph>
            <text />
          </paragraph>
        </component-block-prop>
        <component-inline-prop propPath={['inline']}>
          <text />
        </component-inline-prop>
        <component-block-prop propPath={['block']}>
          <paragraph>
            <text />
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
        component="withLotsOfChildElements"
        props={
          Object {
            "block": null,
            "inline": null,
            "last": null,
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
        <component-block-prop
          propPath={
            Array [
              "last",
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
});

test('toggling to heading when in an inline prop', () => {
  const editor = makeEditor(
    <editor>
      <component-block component="inline" props={{ child: null, other: null }}>
        <component-inline-prop propPath={['child']}>
          <text>
            some
            <cursor />
            thing
          </text>
        </component-inline-prop>
        <component-block-prop propPath={['other']}>
          <paragraph>
            <text>some thing</text>
          </paragraph>
        </component-block-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    {
      componentBlocks: {
        inline: component({
          preview: () => null,
          label: '',
          schema: {
            child: fields.child({ kind: 'inline', placeholder: '' }),
            other: fields.child({ kind: 'block', placeholder: '' }),
          },
        }),
      },
    }
  );
  Transforms.setNodes(editor, { type: 'heading', level: 1 });
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="inline"
        props={
          Object {
            "child": null,
            "other": null,
          }
        }
      >
        <component-inline-prop
          propPath={
            Array [
              "child",
            ]
          }
        >
          <text>
            
          </text>
        </component-inline-prop>
        <component-block-prop
          propPath={
            Array [
              "other",
            ]
          }
        >
          <paragraph>
            <text>
              <cursor />
              some thing
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

test('child field in array field insertBreak', () => {
  const editor = makeEditor(
    <editor>
      <component-block component="myList" props={{ children: [{ content: null, done: false }] }}>
        <component-inline-prop propPath={['children', 0, 'content']}>
          <text>
            something
            <cursor />
          </text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    {
      componentBlocks: {
        myList: component({
          preview: () => null,
          label: '',
          schema: {
            children: fields.array(
              fields.object({
                content: fields.child({ kind: 'inline', placeholder: '' }),
                done: fields.checkbox({ label: '' }),
              })
            ),
          },
        }),
      },
    }
  );
  editor.insertBreak();
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="myList"
        props={
          Object {
            "children": Array [
              Object {
                "content": null,
                "done": false,
              },
              Object {
                "content": null,
                "done": false,
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
              "content",
            ]
          }
        >
          <text>
            something
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            Array [
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
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('child field in array field deleteBackward at end', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="myList"
        props={{
          children: [
            { content: null, done: false },
            { content: null, done: true },
          ],
        }}
      >
        <component-inline-prop propPath={['children', 0, 'content']}>
          <text>something</text>
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
    {
      skipRenderingDOM: true,
      componentBlocks: {
        myList: component({
          preview: () => null,
          label: '',
          schema: {
            children: fields.array(
              fields.object({
                content: fields.child({ kind: 'inline', placeholder: '' }),
                done: fields.checkbox({ label: '' }),
              })
            ),
          },
        }),
      },
    }
  );
  editor.deleteBackward('character');
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="myList"
        props={
          Object {
            "children": Array [
              Object {
                "content": null,
                "done": false,
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
              "content",
            ]
          }
        >
          <text>
            something
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

test('child field in array field deleteBackward in middle', () => {
  const editor = makeEditor(
    <editor>
      <component-block
        component="myList"
        props={{
          children: [
            { content: null, something: '1' },
            { content: null, something: '2' },
            { content: null, something: '3' },
          ],
        }}
      >
        <component-inline-prop propPath={['children', 0, 'content']}>
          <text>first</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 'content']}>
          <text>
            <cursor />
            second
          </text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 2, 'content']}>
          <text>third</text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    {
      skipRenderingDOM: true,
      componentBlocks: {
        myList: component({
          preview: () => null,
          label: '',
          schema: {
            children: fields.array(
              fields.object({
                content: fields.child({ kind: 'inline', placeholder: '' }),
                something: fields.text({ label: '' }),
              })
            ),
          },
        }),
      },
    }
  );
  editor.deleteBackward('character');
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="myList"
        props={
          Object {
            "children": Array [
              Object {
                "content": null,
                "something": "1",
              },
              Object {
                "content": null,
                "something": "3",
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
              "content",
            ]
          }
        >
          <text>
            first
            <cursor />
            second
          </text>
        </component-inline-prop>
        <component-inline-prop
          propPath={
            Array [
              "children",
              1,
              "content",
            ]
          }
        >
          <text>
            third
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

test('normalization adds missing fields on object fields', () => {
  const editor = makeEditor(
    <editor>
      <component-block component="basic" props={{ a: '' }}>
        <component-inline-prop>
          <text />
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    {
      normalization: 'normalize',
      componentBlocks: {
        basic: component({
          preview: () => null,
          label: 'Basic',
          schema: { a: fields.text({ label: 'A' }), b: fields.checkbox({ label: 'B' }) },
        }),
      },
    }
  );
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <component-block
        component="basic"
        props={
          Object {
            "a": "",
            "b": false,
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
