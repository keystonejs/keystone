/** @jsx jsx */
import { jsx, makeEditor } from './tests/utils';

test('columns with no layout are unwrapped', () => {
  let editor = makeEditor(
    <editor>
      <columns layout={undefined as any}>
        <column>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </column>
      </columns>
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

test('columns with not enough columns are added', () => {
  let editor = makeEditor(
    <editor>
      <columns layout={[1, 1]}>
        <column>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </column>
      </columns>
    </editor>,
    { normalization: 'normalize' }
  );

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <columns
        layout={
          Array [
            1,
            1,
          ]
        }
      >
        <column>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </column>
        <column>
          <paragraph>
            <text>
              
            </text>
          </paragraph>
        </column>
      </columns>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('columns with extra columns that are empty are removed', () => {
  let editor = makeEditor(
    <editor>
      <columns layout={[1, 1]}>
        <column>
          <paragraph>
            <text />
          </paragraph>
        </column>
        <column>
          <paragraph>
            <text />
          </paragraph>
        </column>
        <column>
          <paragraph>
            <text />
          </paragraph>
        </column>
        <column>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </column>
      </columns>
    </editor>,
    { normalization: 'normalize' }
  );

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <columns
        layout={
          Array [
            1,
            1,
          ]
        }
      >
        <column>
          <paragraph>
            <text>
              
            </text>
          </paragraph>
        </column>
        <column>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </column>
      </columns>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('the content of extra columns are merged into the last column', () => {
  let editor = makeEditor(
    <editor>
      <columns layout={[1, 1]}>
        <column>
          <paragraph>
            <text />
          </paragraph>
        </column>
        <column>
          <paragraph>
            <text>last column</text>
          </paragraph>
        </column>
        <column>
          <paragraph>
            <text>
              some content <cursor /> more content
            </text>
          </paragraph>
        </column>
        <column>
          <paragraph>
            <text>even more</text>
          </paragraph>
        </column>
        <column>
          <paragraph>
            <text />
          </paragraph>
        </column>
        <column>
          <paragraph>
            <text>even more</text>
          </paragraph>
        </column>
      </columns>
    </editor>,
    { normalization: 'normalize' }
  );

  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <columns
        layout={
          Array [
            1,
            1,
          ]
        }
      >
        <column>
          <paragraph>
            <text>
              
            </text>
          </paragraph>
        </column>
        <column>
          <paragraph>
            <text>
              last column
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
        </column>
      </columns>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('enter in columns never exit column', () => {
  let editor = makeEditor(
    <editor>
      <columns layout={[1]}>
        <column>
          <paragraph>
            <text />
          </paragraph>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </column>
      </columns>
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
      <columns
        layout={
          Array [
            1,
          ]
        }
      >
        <column>
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
        </column>
      </columns>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('delete backward never deletes or exits column in first column', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text />
      </paragraph>
      <columns layout={[1]}>
        <column>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </column>
      </columns>
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
      <columns
        layout={
          Array [
            1,
          ]
        }
      >
        <column>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </column>
      </columns>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

test('delete backward never deletes or exits column in second column', () => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text />
      </paragraph>
      <columns layout={[1, 1]}>
        <column>
          <paragraph>
            <text />
          </paragraph>
        </column>
        <column>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </column>
      </columns>
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
      <columns
        layout={
          Array [
            1,
            1,
          ]
        }
      >
        <column>
          <paragraph>
            <text>
              
            </text>
          </paragraph>
        </column>
        <column>
          <paragraph>
            <text>
              <cursor />
            </text>
          </paragraph>
        </column>
      </columns>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});
