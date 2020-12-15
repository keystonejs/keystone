/** @jsx jsx */
import { jsx, makeEditor } from './tests/utils';

test('component-inline-prop and component-block-prop outside of component-block are unwrapped', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <component-inline-prop>
          <text />
        </component-inline-prop>
      </paragraph>
      <component-block-prop>
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
