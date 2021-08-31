/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { Editor } from 'slate';
import { jsx, makeEditor } from './tests/utils';

test('basic soft break', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          some content
          <cursor />
        </text>
      </paragraph>
    </editor>,
    { isShiftPressedRef: { current: true } }
  );

  editor.insertBreak();
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          some content

          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

test('soft break deletes selection', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          some <anchor />
          conte
          <focus />
          nt
        </text>
      </paragraph>
    </editor>,
    { isShiftPressedRef: { current: true } }
  );

  editor.insertBreak();
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          some 

          <cursor />
          nt
        </text>
      </paragraph>
    </editor>
  `);
  expect(Editor.string(editor, [])).toMatchInlineSnapshot(`
    "some 
    nt"
  `);
});
