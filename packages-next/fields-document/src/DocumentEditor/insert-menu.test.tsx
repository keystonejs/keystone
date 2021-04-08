/** @jest-environment jsdom */
/** @jsx jsx */
import { Transforms } from 'slate';
import { jsx, makeEditor } from './tests/utils';

test('insertMenu mark is removed when cursor is outside with a forced normalize', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text insertMenu>/something</text>
      </paragraph>
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
          /something
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

test('insertMenu mark is not removed when cursor is in the text', () => {
  let editor = makeEditor(
    <editor marks={{ insertMenu: true }}>
      <paragraph>
        <text insertMenu>
          /something
          <cursor />
        </text>
      </paragraph>
    </editor>
  );

  expect(editor).toMatchInlineSnapshot(`
    <editor
      marks={
        Object {
          "insertMenu": true,
        }
      }
    >
      <paragraph>
        <text
          insertMenu={true}
        >
          /something
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

test('insertMenu mark is normalized away when / is not the first character', () => {
  let editor = makeEditor(
    <editor marks={{ insertMenu: true }}>
      <paragraph>
        <text insertMenu>
          something
          <cursor />
        </text>
      </paragraph>
    </editor>,
    { normalization: 'normalize' }
  );

  expect(editor).toMatchInlineSnapshot(`
    <editor
      marks={
        Object {
          "insertMenu": true,
        }
      }
    >
      <paragraph>
        <text>
          something
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

test('insertMenu mark is normalized away when / is not the first character and then a character is inserted, the mark is removed from Editor.marks', () => {
  let editor = makeEditor(
    <editor marks={{ insertMenu: true }}>
      <paragraph>
        <text insertMenu>
          something
          <cursor />
        </text>
      </paragraph>
    </editor>,
    { normalization: 'normalize' }
  );

  editor.insertText('a');

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          somethinga
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

test('insertMenu mark is removed when text is inserted else where in the document', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text insertMenu>/something</text>
      </paragraph>
      <cursor />
    </editor>,
    { normalization: 'skip' }
  );

  editor.insertText('a');

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          /something
        </text>
      </paragraph>
      <paragraph>
        <text>
          a
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

test('insertMenu mark is removed when whitespace is inserted', () => {
  let editor = makeEditor(
    <editor marks={{ insertMenu: true }}>
      <paragraph>
        <text insertMenu>
          /something
          <cursor />
        </text>
      </paragraph>
    </editor>,
    { normalization: 'skip' }
  );

  editor.insertText(' ');

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          /something 
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

test('insertMenu mark is removed when the cursor is moved outside of the text node', () => {
  let editor = makeEditor(
    <editor marks={{ insertMenu: true }}>
      <paragraph>
        <text insertMenu>
          /something
          <cursor />
        </text>
      </paragraph>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { normalization: 'skip' }
  );

  Transforms.move(editor, { unit: 'character' });
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          /something
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

test('insertMenu mark is added when inserting / at the start of a block', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>
  );

  editor.insertText('/');
  expect(editor).toMatchInlineSnapshot(`
    <editor
      marks={
        Object {
          "insertMenu": true,
        }
      }
    >
      <paragraph>
        <text
          insertMenu={true}
        >
          /
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

test('insertMenu mark is added when inserting / after whitespace', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          content <cursor />
        </text>
      </paragraph>
    </editor>
  );

  editor.insertText('/');
  expect(editor).toMatchInlineSnapshot(`
    <editor
      marks={
        Object {
          "insertMenu": true,
        }
      }
    >
      <paragraph>
        <text>
          content 
        </text>
        <text
          insertMenu={true}
        >
          /
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

test('insertMenu mark is added when inserting / after whitespace when there is content after the cursor', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          content <cursor /> more
        </text>
      </paragraph>
    </editor>
  );

  editor.insertText('/');
  expect(editor).toMatchInlineSnapshot(`
    <editor
      marks={
        Object {
          "insertMenu": true,
        }
      }
    >
      <paragraph>
        <text>
          content 
        </text>
        <text
          insertMenu={true}
        >
          /
        </text>
        <text>
          <cursor />
           more
        </text>
      </paragraph>
    </editor>
  `);
  // note the cursor should really be in the text with insertMenu but it all works right in the browser so ¯\_(ツ)_/¯
});

test('insertMenu mark is added when inserting / after whitespace when there is content after the cursor in a different text node', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          content <cursor />
        </text>
        <text bold> more</text>
      </paragraph>
    </editor>
  );

  editor.insertText('/');
  expect(editor).toMatchInlineSnapshot(`
    <editor
      marks={
        Object {
          "insertMenu": true,
        }
      }
    >
      <paragraph>
        <text>
          content 
        </text>
        <text
          insertMenu={true}
        >
          /
          <cursor />
        </text>
        <text
          bold={true}
        >
           more
        </text>
      </paragraph>
    </editor>
  `);
});

test('insertMenu thing typing', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          some content <cursor />
        </text>
      </paragraph>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { normalization: 'normalize' }
  );
  [...'/thing'].forEach(char => {
    editor.insertText(char);
  });
  expect(editor).toMatchInlineSnapshot(`
    <editor
      marks={
        Object {
          "insertMenu": true,
        }
      }
    >
      <paragraph>
        <text>
          some content 
        </text>
        <text
          insertMenu={true}
        >
          /thing
          <cursor />
        </text>
      </paragraph>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);

  editor.insertBreak();

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          some content /thing
        </text>
      </paragraph>
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
