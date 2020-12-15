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
    <editor>
      <code>
        <paragraph>
          <text bold>
            {'asdkjnajsndakjndkjnaksdjn\nasdasdasd\n'}
            <cursor />
          </text>
          <link url="something">
            <text>some thing</text>
          </link>
        </paragraph>
      </code>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { allowNonNormalizedTree: true }
  );

  Editor.normalize(editor, { force: true });

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <code>
        <text>
          asdkjnajsndakjndkjnaksdjn
    asdasdasd

          <cursor />
          some thing
        </text>
      </code>
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
