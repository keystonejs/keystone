/** @jsx jsx */
import { toggleList } from './lists';
import { jsx, makeEditor } from './tests/utils';

test('ordered list shortcut', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          1.
          <cursor />
        </text>
      </paragraph>
    </editor>
  );

  editor.insertText(' ');
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <ordered-list>
        <list-item>
          <text>
            <cursor />
          </text>
        </list-item>
      </ordered-list>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('unordered list shortcut', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          -
          <cursor />
        </text>
      </paragraph>
    </editor>
  );

  editor.insertText(' ');
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <unordered-list>
        <list-item>
          <text>
            <cursor />
          </text>
        </list-item>
      </unordered-list>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('direct sibling lists of the same type are merged', () => {
  let editor = makeEditor(
    <editor>
      <unordered-list>
        <list-item>
          <text>some text</text>
        </list-item>
      </unordered-list>
      <unordered-list>
        <list-item>
          <text>some more text</text>
        </list-item>
      </unordered-list>
      <ordered-list>
        <list-item>
          <text>some more text</text>
        </list-item>
      </ordered-list>
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
      <unordered-list>
        <list-item>
          <text>
            some text
          </text>
        </list-item>
        <list-item>
          <text>
            some more text
          </text>
        </list-item>
      </unordered-list>
      <ordered-list>
        <list-item>
          <text>
            some more text
          </text>
        </list-item>
      </ordered-list>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

test('inserting a break on end of list in empty list item exits list', () => {
  let editor = makeEditor(
    <editor>
      <unordered-list>
        <list-item>
          <text>some text</text>
        </list-item>
        <list-item>
          <text>
            <cursor />
          </text>
        </list-item>
      </unordered-list>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  editor.insertBreak();

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <unordered-list>
        <list-item>
          <text>
            some text
          </text>
        </list-item>
      </unordered-list>
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

test('inserting a break in empty list item in the middle of a list splits and exits', () => {
  let editor = makeEditor(
    <editor>
      <unordered-list>
        <list-item>
          <text>some text</text>
        </list-item>
        <list-item>
          <text>
            <cursor />
          </text>
        </list-item>
        <list-item>
          <text>some text</text>
        </list-item>
      </unordered-list>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  editor.insertBreak();

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <unordered-list>
        <list-item>
          <text>
            some text
          </text>
        </list-item>
      </unordered-list>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
      <unordered-list>
        <list-item>
          <text>
            some text
          </text>
        </list-item>
      </unordered-list>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('toggle list on empty line', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  toggleList(editor, 'ordered-list');

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <ordered-list>
        <list-item>
          <text>
            <cursor />
          </text>
        </list-item>
      </ordered-list>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('toggle list on line with text', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          some text
          <cursor />
        </text>
      </paragraph>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  toggleList(editor, 'ordered-list');

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <ordered-list>
        <list-item>
          <text>
            some text
            <cursor />
          </text>
        </list-item>
      </ordered-list>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('toggle ordered-list inside of ordered-list', () => {
  let editor = makeEditor(
    <editor>
      <ordered-list>
        <list-item>
          <text>
            some text
            <cursor />
          </text>
        </list-item>
      </ordered-list>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  toggleList(editor, 'ordered-list');

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          some text
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

test('toggle ordered-list inside of multi-item ordered-list', () => {
  let editor = makeEditor(
    <editor>
      <ordered-list>
        <list-item>
          <text>some text</text>
        </list-item>
        <list-item>
          <text>
            some more text
            <cursor />
          </text>
        </list-item>
        <list-item>
          <text>even more text</text>
        </list-item>
      </ordered-list>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  toggleList(editor, 'ordered-list');

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <ordered-list>
        <list-item>
          <text>
            some text
          </text>
        </list-item>
      </ordered-list>
      <paragraph>
        <text>
          some more text
          <cursor />
        </text>
      </paragraph>
      <ordered-list>
        <list-item>
          <text>
            even more text
          </text>
        </list-item>
      </ordered-list>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('toggle unordered-list inside of single item in multi-item ordered-list', () => {
  let editor = makeEditor(
    <editor>
      <ordered-list>
        <list-item>
          <text>some text</text>
        </list-item>
        <list-item>
          <text>
            some more text
            <cursor />
          </text>
        </list-item>
        <list-item>
          <text>even more text</text>
        </list-item>
      </ordered-list>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  toggleList(editor, 'unordered-list');

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <ordered-list>
        <list-item>
          <text>
            some text
          </text>
        </list-item>
      </ordered-list>
      <unordered-list>
        <list-item>
          <text>
            some more text
            <cursor />
          </text>
        </list-item>
      </unordered-list>
      <ordered-list>
        <list-item>
          <text>
            even more text
          </text>
        </list-item>
      </ordered-list>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('toggle unordered-list for all items in multi-item ordered-list', () => {
  let editor = makeEditor(
    <editor>
      <ordered-list>
        <list-item>
          <text>
            <anchor />
            some text
          </text>
        </list-item>
        <list-item>
          <text>some more text</text>
        </list-item>
        <list-item>
          <text>
            even more text
            <focus />
          </text>
        </list-item>
      </ordered-list>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  toggleList(editor, 'unordered-list');

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <unordered-list>
        <list-item>
          <text>
            <anchor />
            some text
          </text>
        </list-item>
        <list-item>
          <text>
            some more text
          </text>
        </list-item>
        <list-item>
          <text>
            even more text
            <focus />
          </text>
        </list-item>
      </unordered-list>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('backspace at start of list', () => {
  let editor = makeEditor(
    <editor>
      <ordered-list>
        <list-item>
          <text>
            <cursor />
            some text
          </text>
        </list-item>
        <list-item>
          <text>some more text</text>
        </list-item>
        <list-item>
          <text>even more text</text>
        </list-item>
      </ordered-list>
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
          even more text
        </text>
      </paragraph>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});
