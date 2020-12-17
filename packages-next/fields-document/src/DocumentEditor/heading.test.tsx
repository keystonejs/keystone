/** @jsx jsx */
import { jsx, makeEditor } from './tests/utils';

test('inserting a heading with a shortcut works', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          #
          <cursor />
        </text>
      </paragraph>
    </editor>
  );

  editor.insertText(' ');
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <heading
        level={1}
      >
        <text>
          <cursor />
        </text>
      </heading>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('inserting a break at the end of the heading exits the heading', () => {
  let editor = makeEditor(
    <editor>
      <heading level={1}>
        <text>
          Some heading
          <cursor />
        </text>
      </heading>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  editor.insertBreak();
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <heading
        level={1}
      >
        <text>
          Some heading
        </text>
      </heading>
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

test('inserting a break in the middle of the heading splits the text and exits the heading', () => {
  let editor = makeEditor(
    <editor>
      <heading level={1}>
        <text>
          Some <cursor />
          heading
        </text>
      </heading>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  editor.insertBreak();
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <heading
        level={1}
      >
        <text>
          Some 
        </text>
      </heading>
      <paragraph>
        <text>
          <cursor />
          heading
        </text>
      </paragraph>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});
