/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { Editor } from 'slate';
import { jsx, makeEditor } from './tests/utils';

test('inserting a code block with a shortcut works', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          {'``'}
          <cursor />
        </text>
      </paragraph>
    </editor>
  );

  editor.insertText('`');
  editor.insertText('some content');
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <code>
        <text>
          some content
          <cursor />
        </text>
      </code>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('insertBreak inserts a soft break', () => {
  let editor = makeEditor(
    <editor>
      <code>
        <text>
          {'asdkjnajsndakjndkjnaksdjn\nasdasdasd'}
          <cursor />
        </text>
      </code>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  editor.insertBreak();

  editor.insertText('some text');

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <code>
        <text>
          asdkjnajsndakjndkjnaksdjn
    asdasdasd
    some text
          <cursor />
        </text>
      </code>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('non-text is removed from code blocks', () => {
  let editor = makeEditor(
    <editor marks={{ bold: true }}>
      <code>
        <paragraph>
          <text bold>
            {'asdkjnajsndakjndkjnaksdjn\nasdasdasd\n'}
            <cursor />
          </text>
          <element type="inline-void">
            <text />
          </element>
          <divider>
            <text />
          </divider>
          <link href="something">
            <text>some thing</text>
          </link>
        </paragraph>
      </code>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { normalization: 'skip' }
  );

  const { isVoid, isInline } = editor;
  editor.isVoid = element => {
    return (element as any).type === 'inline-void' || isVoid(element);
  };
  editor.isInline = element => {
    return (element as any).type === 'inline-void' || isInline(element);
  };

  Editor.normalize(editor, { force: true });

  expect(editor).toMatchInlineSnapshot(`
    <editor
      marks={
        Object {
          "bold": true,
        }
      }
    >
      <code>
        <text>
          asdkjnajsndakjndkjnaksdjn
    asdasdasd

          <cursor />
          some thing
        </text>
      </code>
      <divider
        @@isVoid={true}
      >
        <text>
          
        </text>
      </divider>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('insertBreak when at end with \n as last character exits code block', () => {
  let editor = makeEditor(
    <editor>
      <code>
        <text>
          {'asdkjnajsndakjndkjnaksdjn\nasdasdasd\n'}
          <cursor />
        </text>
      </code>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  editor.insertBreak();

  expect(editor).toMatchInlineSnapshot(`
      <editor>
        <code>
          <text>
            asdkjnajsndakjndkjnaksdjn
      asdasdasd
          </text>
        </code>
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

test('insertBreak in the middle of the text when there is a break at the end of the text', () => {
  let editor = makeEditor(
    <editor>
      <code>
        <text>
          some text
          <cursor />
          {'more text\n'}
        </text>
      </code>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  );

  editor.insertBreak();
  expect((editor as any).children[0].children[0].text).toMatchInlineSnapshot(`
    "some text
    more text
    "
  `);
});
