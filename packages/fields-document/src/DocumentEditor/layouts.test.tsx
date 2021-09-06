/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, makeEditor } from './tests/utils';

test('layout with no layout are unwrapped', () => {
  let editor = makeEditor(
    <editor>
      <layout layout={undefined as any}>
        <layout-area>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </layout-area>
      </layout>
    </editor>,
    { normalization: 'normalize' }
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

test('layout with not enough layout-area are added', () => {
  let editor = makeEditor(
    <editor>
      <layout layout={[1, 1]}>
        <layout-area>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </layout-area>
      </layout>
    </editor>,
    { normalization: 'normalize' }
  );

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <layout
        layout={
          Array [
            1,
            1,
          ]
        }
      >
        <layout-area>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </layout-area>
        <layout-area>
          <paragraph>
            <text>
              
            </text>
          </paragraph>
        </layout-area>
      </layout>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('layout with extra layout-areas that are empty are removed', () => {
  let editor = makeEditor(
    <editor>
      <layout layout={[1, 1]}>
        <layout-area>
          <paragraph>
            <text />
          </paragraph>
        </layout-area>
        <layout-area>
          <paragraph>
            <text />
          </paragraph>
        </layout-area>
        <layout-area>
          <paragraph>
            <text />
          </paragraph>
        </layout-area>
        <layout-area>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </layout-area>
      </layout>
    </editor>,
    { normalization: 'normalize' }
  );

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <layout
        layout={
          Array [
            1,
            1,
          ]
        }
      >
        <layout-area>
          <paragraph>
            <text>
              
            </text>
          </paragraph>
        </layout-area>
        <layout-area>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </layout-area>
      </layout>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('the content of extra layout-areas are merged into the last layout-area', () => {
  let editor = makeEditor(
    <editor>
      <layout layout={[1, 1]}>
        <layout-area>
          <paragraph>
            <text />
          </paragraph>
        </layout-area>
        <layout-area>
          <paragraph>
            <text>last layout area</text>
          </paragraph>
        </layout-area>
        <layout-area>
          <paragraph>
            <text>
              some content <cursor /> more content
            </text>
          </paragraph>
        </layout-area>
        <layout-area>
          <paragraph>
            <text>even more</text>
          </paragraph>
        </layout-area>
        <layout-area>
          <paragraph>
            <text />
          </paragraph>
        </layout-area>
        <layout-area>
          <paragraph>
            <text>even more</text>
          </paragraph>
        </layout-area>
      </layout>
    </editor>,
    { normalization: 'normalize' }
  );

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <layout
        layout={
          Array [
            1,
            1,
          ]
        }
      >
        <layout-area>
          <paragraph>
            <text>
              
            </text>
          </paragraph>
        </layout-area>
        <layout-area>
          <paragraph>
            <text>
              last layout area
            </text>
          </paragraph>
          <paragraph>
            <text>
              some content 
              <cursor />
               more content
            </text>
          </paragraph>
          <paragraph>
            <text>
              even more
            </text>
          </paragraph>
          <paragraph>
            <text>
              even more
            </text>
          </paragraph>
        </layout-area>
      </layout>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('enter in layout area never exits layout area', () => {
  let editor = makeEditor(
    <editor>
      <layout layout={[1]}>
        <layout-area>
          <paragraph>
            <text />
          </paragraph>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </layout-area>
      </layout>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    {}
  );

  editor.insertBreak();
  editor.insertBreak();
  editor.insertBreak();

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <layout
        layout={
          Array [
            1,
          ]
        }
      >
        <layout-area>
          <paragraph>
            <text>
              
            </text>
          </paragraph>
          <paragraph>
            <text>
              
            </text>
          </paragraph>
          <paragraph>
            <text>
              
            </text>
          </paragraph>
          <paragraph>
            <text>
              
            </text>
          </paragraph>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </layout-area>
      </layout>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('delete backward never deletes or exits in first layout area', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text />
      </paragraph>
      <layout layout={[1]}>
        <layout-area>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </layout-area>
      </layout>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    {}
  );

  editor.deleteBackward('character');
  editor.deleteBackward('character');
  editor.deleteBackward('character');

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
      <layout
        layout={
          Array [
            1,
          ]
        }
      >
        <layout-area>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </layout-area>
      </layout>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('delete backward never deletes or exits in second layout area', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text />
      </paragraph>
      <layout layout={[1, 1]}>
        <layout-area>
          <paragraph>
            <text />
          </paragraph>
        </layout-area>
        <layout-area>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </layout-area>
      </layout>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    {}
  );

  editor.deleteBackward('character');
  editor.deleteBackward('character');
  editor.deleteBackward('character');

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
      <layout
        layout={
          Array [
            1,
            1,
          ]
        }
      >
        <layout-area>
          <paragraph>
            <text>
              
            </text>
          </paragraph>
        </layout-area>
        <layout-area>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </layout-area>
      </layout>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});
