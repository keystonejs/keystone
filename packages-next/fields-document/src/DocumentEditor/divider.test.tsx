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
      <paragraph>
        <text>
          
        </text>
      </paragraph>
      <divider
        @@isVoid={true}
      >
        <text>
          <cursor />
        </text>
      </divider>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});
