/** @jsx jsx */
import { shortcuts } from './shortcuts';
import { jsx, makeEditor } from './tests/utils';

describe.each(Object.entries(shortcuts))('shortcut "%s" for "%s"', (shortcut, result) => {
  test('shortcut at start of block', () => {
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
});
