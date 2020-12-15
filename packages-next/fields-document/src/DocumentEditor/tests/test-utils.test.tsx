/** @jsx jsx */
import { jsx, makeEditor } from './utils';

test('basic cursor snapshot', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>
  );
  expect(editor).toMatchInlineSnapshot(`
      <editor>
        <paragraph>
          <text>
            <cursor />
          </text>
        </paragraph>
      </editor>
    `);
});

test('cursor in the middle of text', () => {
  expect(
    makeEditor(
      <editor>
        <paragraph>
          <text>
            some
            <cursor />
            text
          </text>
        </paragraph>
      </editor>
    )
  ).toMatchInlineSnapshot(`
      <editor>
        <paragraph>
          <text>
            some
            <cursor />
            text
          </text>
        </paragraph>
      </editor>
    `);
});

test('cursor split in the same text', () => {
  expect(
    makeEditor(
      <editor>
        <paragraph>
          <text>
            some
            <anchor />
            text
            <focus />
          </text>
        </paragraph>
      </editor>
    )
  ).toMatchInlineSnapshot(`
      <editor>
        <paragraph>
          <text>
            some
            <anchor />
            text
            <focus />
          </text>
        </paragraph>
      </editor>
    `);
  expect(
    makeEditor(
      <editor>
        <paragraph>
          <text>
            some
            <focus />
            text
            <anchor />
          </text>
        </paragraph>
      </editor>
    )
  ).toMatchInlineSnapshot(`
      <editor>
        <paragraph>
          <text>
            some
            <focus />
            text
            <anchor />
          </text>
        </paragraph>
      </editor>
    `);
});

test('cursor split in different text', () => {
  expect(
    makeEditor(
      <editor>
        <paragraph>
          <text>
            some
            <anchor />
            text
          </text>
        </paragraph>
        <paragraph>
          <text>
            somete
            <focus />
            xt
          </text>
        </paragraph>
      </editor>
    )
  ).toMatchInlineSnapshot(`
      <editor>
        <paragraph>
          <text>
            some
            <anchor />
            text
          </text>
        </paragraph>
        <paragraph>
          <text>
            somete
            <focus />
            xt
          </text>
        </paragraph>
      </editor>
    `);
  expect(
    makeEditor(
      <editor>
        <paragraph>
          <text>
            some
            <focus />
            text
          </text>
        </paragraph>
        <paragraph>
          <text>
            somete
            <anchor />
            xt
          </text>
        </paragraph>
      </editor>
    )
  ).toMatchInlineSnapshot(`
      <editor>
        <paragraph>
          <text>
            some
            <focus />
            text
          </text>
        </paragraph>
        <paragraph>
          <text>
            somete
            <anchor />
            xt
          </text>
        </paragraph>
      </editor>
    `);
});

test('throws on non-normalized input', () => {
  expect(() =>
    makeEditor(
      <editor>
        <paragraph>
          <paragraph>
            <text>
              some
              <cursor />
              text
            </text>
          </paragraph>
        </paragraph>
      </editor>
    )
  ).toThrow();
});
