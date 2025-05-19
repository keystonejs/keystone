/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { expect, test } from 'vitest'
import { jsx, renderEditor } from './utils'

test('inserting a divider with a shortcut works', async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text>
          --
          <cursor />
        </text>
      </paragraph>
    </doc>
  )

  await user.keyboard('-')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <node_selection>
        <divider />
      </node_selection>
    </doc>
  `)
})
