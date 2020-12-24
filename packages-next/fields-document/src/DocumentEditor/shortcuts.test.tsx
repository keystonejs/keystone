/** @jsx jsx */
import { shortcuts } from './shortcuts';
import { jsx, makeEditor } from './tests/utils';

test.each(Object.entries(shortcuts))('shortcut "%s" for "%s"', (shortcut, result) => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          {shortcut}
          <cursor />
        </text>
      </paragraph>
    </editor>
  );

  editor.insertText(' ');
  expect(editor).toEqualEditor(
    makeEditor(
      <editor>
        <paragraph>
          <text>
            {result + ' '}
            <cursor />
          </text>
        </paragraph>
      </editor>
    )
  );
});
