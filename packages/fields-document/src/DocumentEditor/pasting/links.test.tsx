/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { type Editor } from 'slate'
import { makeEditor, jsx } from '../tests/utils'
import { MyDataTransfer } from './data-transfer'

function pasteText (editor: Editor, text: string) {
  const data = new MyDataTransfer()
  data.setData('text/plain', text)
  editor.insertData(data)
}

test('pasting a url on some text wraps the text with a link', () => {
  const editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          blah <anchor />
          blah
          <focus /> blah
        </text>
      </paragraph>
    </editor>
  )
  pasteText(editor, 'https://keystonejs.com')
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          blah 
        </text>
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            <anchor />
            blah
            <focus />
          </text>
        </link>
        <text>
           blah
        </text>
      </paragraph>
    </editor>
  `)
})

test('pasting a url on a selection spanning multiple blocks replaces the selection with the url', () => {
  const editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          start should still exist <anchor />
          blah blah
        </text>
      </paragraph>
      <paragraph>
        <text>
          blah blah
          <focus /> end should still exist
        </text>
      </paragraph>
    </editor>
  )
  pasteText(editor, 'https://keystonejs.com')
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          start should still exist 
        </text>
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            https://keystonejs.com
            <cursor />
          </text>
        </link>
        <text>
           end should still exist
        </text>
      </paragraph>
    </editor>
  `)
})

test('pasting a url on a selection with a link inside replaces the selection with the url', () => {
  const editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          start should still exist <anchor />
          should{' '}
        </text>
        <link href="https://keystonejs.com/docs">
          <text>be</text>
        </link>
        <text>
          replaced
          <focus /> end should still exist
        </text>
      </paragraph>
    </editor>
  )
  pasteText(editor, 'https://keystonejs.com')
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          start should still exist 
        </text>
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            https://keystonejs.com
            <cursor />
          </text>
        </link>
        <text>
           end should still exist
        </text>
      </paragraph>
    </editor>
  `)
})
