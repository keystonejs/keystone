/** @jest-environment jsdom */
import React, { useState } from 'react';
import { createEditor, Editor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { render } from '@testing-library/react';
import { makeEditor } from '../tests/utils';
import { MyDataTransfer } from './data-transfer';

function OtherEditor({ editor }: { editor: Editor }) {
  // note that the entire point here is to have a different document structure to Keystone's
  const [val, setVal] = useState(
    () =>
      [
        {
          isHeading: true,
          children: [
            {
              text: 'some heading',
            },
          ],
        },
        {
          isHeading: false,
          children: [
            {
              strong: true,
              text: 'some heading',
            },
          ],
        },
      ] as any
  );
  return (
    <Slate editor={editor} onChange={setVal} value={val}>
      <Editable
        renderElement={({ element, attributes, children }) => {
          return (element as any).isHeading ? (
            <h1 {...attributes}>{children}</h1>
          ) : (
            <p>{children}</p>
          );
        }}
        renderLeaf={({ attributes, children, leaf }) => {
          return (leaf as any).strong ? (
            <strong {...attributes}>{children}</strong>
          ) : (
            <span {...attributes}>{children}</span>
          );
        }}
      />
    </Slate>
  );
}

// this is important because a user might copy content from some other slate editor
// and because slate inserts the slate content into the DataTransfer, Slate would normally
// try to just insert that content but if it's from a non-Keystone editor
// we prevent this from being a problem by inserting some data onto the DataTransfer
// to indicate that it's from Keystone's document editor and not some other slate editor
test('pasting from another slate editor works', () => {
  const otherEditor = withReact(createEditor());
  render(<OtherEditor editor={otherEditor} />);
  otherEditor.selection = {
    anchor: Editor.start(otherEditor, []),
    focus: Editor.end(otherEditor, []),
  };
  const data = new MyDataTransfer();
  otherEditor.setFragmentData(data);
  const newIntermediateEditor = createEditor();
  newIntermediateEditor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
  newIntermediateEditor.selection = {
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 0, path: [0, 0] },
  };
  const editor = makeEditor(newIntermediateEditor);
  editor.insertData(data);
  expect(editor).toMatchInlineSnapshot(`
    <editor
      marks={
        Object {
          "bold": true,
        }
      }
    >
      <heading
        level={1}
      >
        <text>
          some heading
        </text>
      </heading>
      <paragraph>
        <text
          bold={true}
        >
          some heading
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});
