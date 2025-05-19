/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { expect, test, describe } from 'vitest'
import { shortcuts } from '../inputrules/shortcuts'
import { jsx, redo, renderEditor, undo } from './utils'

describe.each(Object.entries(shortcuts))('shortcut "%s" for "%s"', (shortcut, result) => {
  const inputDoc = (
    <doc>
      <paragraph>
        <text>
          {shortcut}
          <cursor />
        </text>
      </paragraph>
    </doc>
  )
  const resultingState = (
    <doc>
      <paragraph>
        <text>
          {result + ' '}
          <cursor />
        </text>
      </paragraph>
    </doc>
  )
  test('can be inserted', async () => {
    const { state, user } = renderEditor(inputDoc)
    await user.keyboard(' ')
    expect(state()).toEqual(resultingState)
  })
  const undoneEditorState = (
    <doc>
      <paragraph>
        <text>
          {shortcut + ' '}
          <cursor />
        </text>
      </paragraph>
    </doc>
  )
  test('the replacement can be undone', async () => {
    const { state, user } = renderEditor(inputDoc)
    await user.keyboard(' ')
    expect(state()).toEqual(resultingState)
    await undo(user)
    expect(state()).toEqual(undoneEditorState)
  })
  test('the replacement can be redone', async () => {
    const { state, user } = renderEditor(inputDoc)
    await user.keyboard(' ')
    expect(state()).toEqual(resultingState)
    await undo(user)
    expect(state()).toEqual(undoneEditorState)
    await redo(user)
    expect(state()).toEqual(resultingState)
  })
})
