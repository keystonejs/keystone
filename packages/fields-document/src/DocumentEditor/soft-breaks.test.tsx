/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { Editor } from 'slate'
import { jsx, makeEditor } from './tests/utils'

test('basic soft break', () => {
  const editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          some content
          <cursor />
        </text>
      </paragraph>
    </editor>
  )

  editor.insertSoftBreak()
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          some content

          <cursor />
        </text>
      </paragraph>
    </editor>
  `)
})

test('soft break deletes selection', () => {
  const editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          some <anchor />
          conte
          <focus />
          nt
        </text>
      </paragraph>
    </editor>
  )

  editor.insertSoftBreak()
  expect(editor).toMatchInlineSnapshot(`
    <editor>
      <paragraph>
        <text>
          some 

          <cursor />
          nt
        </text>
      </paragraph>
    </editor>
  `)
  expect(Editor.string(editor, [])).toMatchInlineSnapshot(`
    "some 
    nt"
  `)
})
