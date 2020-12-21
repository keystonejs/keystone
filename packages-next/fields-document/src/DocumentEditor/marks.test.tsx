/** @jsx jsx */
import { allMarkdownShortcuts } from './marks';
import { jsx, makeEditor } from './tests/utils';

describe.each(
  (Object.keys(allMarkdownShortcuts) as (keyof typeof allMarkdownShortcuts)[])
    .map(mark => allMarkdownShortcuts[mark].map(shortcut => [mark, shortcut]))
    .flat() as [keyof typeof allMarkdownShortcuts, string][]
)('%s with shortcut "%s"', (markName, shortcut) => {
  test('basic shortcut usage', () => {
    let editor = makeEditor(
      <editor>
        <paragraph>
          <text>
            {shortcut}thing{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>
    );

    editor.insertText(shortcut.slice(-1));
    expect(editor).toEqualEditor(
      <editor>
        <paragraph>
          <text {...{ [markName]: true }}>
            thing
            <cursor />
          </text>
        </paragraph>
      </editor>
    );
  });
  test('works when selection is not collapsed', () => {
    let editor = makeEditor(
      <editor>
        <paragraph>
          <text>
            {shortcut}thing{shortcut.slice(0, -1)}
            <anchor />
            some wonderful content
            <focus />
          </text>
        </paragraph>
      </editor>
    );

    editor.insertText(shortcut.slice(-1));
    expect(editor).toEqualEditor(
      <editor>
        <paragraph>
          <text {...{ [markName]: true }}>
            thing
            <cursor />
          </text>
        </paragraph>
      </editor>
    );
  });
  test('works when the start and ends are in different text nodes', () => {
    let editor = makeEditor(
      <editor>
        <paragraph>
          <text>{shortcut}t</text>
          <text keyboard>hin</text>
          <text>
            g{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>
    );

    editor.insertText(shortcut.slice(-1));
    expect(editor).toEqualEditor(
      <editor>
        <paragraph>
          <text {...{ [markName]: true }}>t</text>
          <text keyboard {...{ [markName]: true }}>
            hin
          </text>
          <text {...{ [markName]: true }}>
            g
            <cursor />
          </text>
        </paragraph>
      </editor>
    );
  });
  if (shortcut.length === 2) {
    // these two tests are kinda conflicting, yes
    // this behaviour is just an artifact of the implementation
    // i don't really think that having the parts of a shortcut in different text nodes will happen
    // (as in each of the characters in __ in two different text nodes, having the start and end of the shortcut in different text nodes works totally fine)
    // these tests are about ensuring that things don't crash when this does happen
    test('matches when first and second characters in the end shortcut are in different text nodes', () => {
      let editor = makeEditor(
        <editor>
          <paragraph>
            <text>{shortcut}thing</text>
            <text keyboard>
              {shortcut.slice(0, -1)}
              <cursor />
            </text>
          </paragraph>
        </editor>
      );

      editor.insertText(shortcut.slice(-1));
      expect(editor).toEqualEditor(
        <editor>
          <paragraph>
            <text {...{ [markName]: true }}>
              thing
              <cursor />
            </text>
          </paragraph>
        </editor>
      );
    });
    test('does not match when first and second characters in the start shortcut are in different text nodes', () => {
      let editor = makeEditor(
        <editor>
          <paragraph>
            <text keyboard>{shortcut[0]}</text>
            <text>
              {shortcut[1]}thing{shortcut.slice(0, -1)}
              <cursor />
            </text>
          </paragraph>
        </editor>
      );

      editor.insertText(shortcut.slice(-1));
      expect(editor).toEqualEditor(
        <editor>
          <paragraph>
            <text keyboard>{shortcut[0]}</text>
            <text>
              {shortcut[1]}thing{shortcut}
              <cursor />
            </text>
          </paragraph>
        </editor>
      );
    });
  }
  test('matches when the shortcut appears in an invalid position after the valid position in the same text node', () => {
    let editor = makeEditor(
      <editor>
        <paragraph>
          <text>
            some text {shortcut}t{shortcut}hing{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>
    );

    editor.insertText(shortcut.slice(-1));
    expect(editor).toEqualEditor(
      <editor>
        <paragraph>
          <text>some text </text>
          <text {...{ [markName]: true }}>
            t{shortcut}hing
            <cursor />
          </text>
        </paragraph>
      </editor>
    );
  });
  test('matches when the shortcut appears in an invalid position before the valid position in the same text node', () => {
    let editor = makeEditor(
      <editor>
        <paragraph>
          <text>
            some{shortcut}text {shortcut}thing{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>
    );

    editor.insertText(shortcut.slice(-1));
    expect(editor).toEqualEditor(
      <editor>
        <paragraph>
          <text>some{shortcut}text </text>
          <text {...{ [markName]: true }}>
            thing
            <cursor />
          </text>
        </paragraph>
      </editor>
    );
  });
  test("does not match when there is a different text node before the start of the shortcut that doesn't end in whitespace", () => {
    let editor = makeEditor(
      <editor>
        <paragraph>
          <text keyboard>some text</text>
          <text>
            {shortcut}thing{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>
    );

    editor.insertText(shortcut.slice(-1));
    expect(editor).toEqualEditor(
      <editor>
        <paragraph>
          <text keyboard>some text</text>
          <text>
            {shortcut}thing{shortcut}
            <cursor />
          </text>
        </paragraph>
      </editor>
    );
  });
  test('does not match when there is nothing between the start and end of the shortcut', () => {
    let editor = makeEditor(
      <editor>
        <paragraph>
          <text>
            {shortcut + shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>
    );
    editor.insertText(shortcut.slice(-1));
    expect(editor).toEqualEditor(
      <editor>
        <paragraph>
          <text>
            {shortcut.repeat(2)}
            <cursor />
          </text>
        </paragraph>
      </editor>
    );
  });
  test('does not match when there is whitespace immediately after the end of the start of the shortcut', () => {
    let editor = makeEditor(
      <editor>
        <paragraph>
          <text>
            {shortcut} thing{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>
    );

    editor.insertText(shortcut.slice(-1));
    expect(editor).toEqualEditor(
      <editor>
        <paragraph>
          <text>
            {shortcut} thing{shortcut}
            <cursor />
          </text>
        </paragraph>
      </editor>
    );
  });
  test('does not match when there is whitespace immediately before the start of the end shortcut', () => {
    let editor = makeEditor(
      <editor>
        <paragraph>
          <text>
            {shortcut}thing {shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>
    );

    editor.insertText(shortcut.slice(-1));
    expect(editor).toEqualEditor(
      <editor>
        <paragraph>
          <text>
            {shortcut}thing {shortcut}
            <cursor />
          </text>
        </paragraph>
      </editor>
    );
  });
  test('does not match if there is a non-whitespace character before the start of the shortcut', () => {
    let editor = makeEditor(
      <editor>
        <paragraph>
          <text>
            w{shortcut}thing{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>
    );

    editor.insertText(shortcut.slice(-1));
    expect(editor).toEqualEditor(
      <editor>
        <paragraph>
          <text>
            w{shortcut}thing{shortcut}
            <cursor />
          </text>
        </paragraph>
      </editor>
    );
  });
  test('does match if there is content before the text but still whitespace before the shortcut', () => {
    let editor = makeEditor(
      <editor>
        <paragraph>
          <text>
            w {shortcut}thing{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>
    );

    editor.insertText(shortcut.slice(-1));
    expect(editor).toEqualEditor(
      <editor>
        <paragraph>
          <text>w </text>
          <text {...{ [markName]: true }}>
            thing
            <cursor />
          </text>
        </paragraph>
      </editor>
    );
  });
});
