/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { expect, test } from 'vitest'
import { jsx, renderEditor, undo } from './utils'

for (const level of [1, 2, 3, 4, 5, 6]) {
  const shortcut = '#'.repeat(level)
  const editorStateWithLevel = (
    <doc>
      <heading level={level}>
        <cursor />
      </heading>
    </doc>
  )
  const docWithShortcut = (
    <doc>
      <paragraph>
        <text>
          {shortcut}
          <cursor />
        </text>
      </paragraph>
    </doc>
  )
  test(`inserting a heading with ${shortcut} works`, async () => {
    const { state, user } = renderEditor(docWithShortcut)
    await user.keyboard(' ')
    expect(state()).toEqual(editorStateWithLevel)
  })
  const undoneEditorState = (
    <doc>
      <paragraph>
        <text>
          {shortcut} <cursor />
        </text>
      </paragraph>
    </doc>
  )
  test(`inserting a heading with ${shortcut} works then undoing it returns back to with the shortcut`, async () => {
    const { state, user } = renderEditor(docWithShortcut)
    await user.keyboard(' ')
    expect(state()).toEqual(editorStateWithLevel)
    await undo(user)
    expect(state()).toEqual(undoneEditorState)
  })

  test(`inserting a heading with ${shortcut} works then undoing it and redoing it works`, async () => {
    const { state, user } = renderEditor(docWithShortcut)
    await user.keyboard(' ')
    expect(state()).toEqual(editorStateWithLevel)
    await user.keyboard('{Control>}z{/Control}')
    expect(state()).toEqual(undoneEditorState)
    await user.keyboard('{Control>}{Shift>}z{/Control}{/Shift}')
    expect(state()).toEqual(editorStateWithLevel)
  })
}

test('inserting a break at the end of the heading exits the heading', async () => {
  const { state, user } = renderEditor(
    <doc>
      <heading level={1}>
        <text>
          Some heading
          <cursor />
        </text>
      </heading>
    </doc>
  )

  await user.keyboard('{Enter}')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <heading
        level={1}

      >
        <text>
          Some heading
        </text>
      </heading>
      <paragraph>
        <cursor />
      </paragraph>
    </doc>
  `)
})

test('inserting a break in the middle of the heading splits the text and does not exit the heading', async () => {
  const { state, user } = renderEditor(
    <doc>
      <heading level={1}>
        <text>
          Some <cursor />
          heading
        </text>
      </heading>
    </doc>
  )

  await user.keyboard('{Enter}')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <heading
        level={1}

      >
        <text>
          Some 
        </text>
      </heading>
      <heading
        level={1}

      >
        <text>
          <cursor />
          heading
        </text>
      </heading>
    </doc>
  `)
})

test('inserting a break at the start of the heading inserts a paragraph above the heading', async () => {
  const { state, user } = renderEditor(
    <doc>
      <heading level={1}>
        <text>
          <cursor />
          Some heading
        </text>
      </heading>
    </doc>
  )

  await user.keyboard('{Enter}')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph />
      <heading
        level={1}

      >
        <text>
          <cursor />
          Some heading
        </text>
      </heading>
    </doc>
  `)
})
