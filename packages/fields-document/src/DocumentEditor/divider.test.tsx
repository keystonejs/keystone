/** @jest-environment jsdom */
/** @jsx jsx */
import { jsx, makeEditor } from './tests/utils';

test('inserting a divider with a shortcut works', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          --
          <cursor />
        </text>
      </paragraph>
    </editor>
  );

  editor.insertText('-');
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <divider
        @@isVoid={true}
      >
        <text>
          
        </text>
      </divider>
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
