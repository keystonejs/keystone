/** @jest-environment jsdom */
/** @jsx jsx */
import { jsx, makeEditor } from './tests/utils';

test('inserting a blockquote with a shortcut works', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          {'>'}
          <cursor />
        </text>
      </paragraph>
    </editor>
  );
  editor.insertText(' ');
  editor.insertText('some content');
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <blockquote>
        <paragraph>
          <text>
            some content
            <cursor />
          </text>
        </paragraph>
      </blockquote>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('backspace at start of blockquote', () => {
  let editor = makeEditor(
    <editor>
      <blockquote>
        <paragraph>
          <text>
            <cursor />
            some content
          </text>
        </paragraph>
      </blockquote>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  editor.deleteBackward('character');
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          <cursor />
          some content
        </text>
      </paragraph>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('enter on empty line at end of blockquote exits blockquote', () => {
  let editor = makeEditor(
    <editor>
      <blockquote>
        <paragraph>
          <text>
            <cursor />
            some content
          </text>
        </paragraph>
      </blockquote>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  editor.deleteBackward('character');
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          <cursor />
          some content
        </text>
      </paragraph>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('enter on empty line in middle splits the blockquote', () => {
  let editor = makeEditor(
    <editor>
      <blockquote>
        <paragraph>
          <text>some content</text>
        </paragraph>
        <paragraph>
          <text>
            <cursor />
          </text>
        </paragraph>
        <paragraph>
          <text>some content</text>
        </paragraph>
      </blockquote>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  editor.insertBreak();
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <blockquote>
        <paragraph>
          <text>
            some content
          </text>
        </paragraph>
      </blockquote>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
      <blockquote>
        <paragraph>
          <text>
            some content
          </text>
        </paragraph>
      </blockquote>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});
