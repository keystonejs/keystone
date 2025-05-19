/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { expect, test } from 'vitest'
import { jsx, renderEditor } from './utils'

test('inserting a blockquote with a shortcut works', async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text>
          {'>'}
          <cursor />
        </text>
      </paragraph>
    </doc>
  )
  await user.keyboard(' ')
  await user.keyboard('some content')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <blockquote>
        <paragraph>
          <text>
            some content
            <cursor />
          </text>
        </paragraph>
      </blockquote>
    </doc>
  `)
})

test('backspace at start of blockquote', async () => {
  const { state, user } = renderEditor(
    <doc>
      <blockquote>
        <paragraph>
          <text>
            <cursor />
            some content
          </text>
        </paragraph>
      </blockquote>
    </doc>
  )
  await user.keyboard('{Backspace}')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          <cursor />
          some content
        </text>
      </paragraph>
    </doc>
  `)
})

test('enter on empty line at end of blockquote exits blockquote', async () => {
  const { user, state } = renderEditor(
    <doc>
      <blockquote>
        <paragraph>
          <text>some content</text>
        </paragraph>
        <paragraph>
          <cursor />
        </paragraph>
      </blockquote>
    </doc>
  )

  await user.keyboard('{Enter}')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <blockquote>
        <paragraph>
          <text>
            some content
          </text>
        </paragraph>
      </blockquote>
      <paragraph>
        <cursor />
      </paragraph>
    </doc>
  `)
})

test('enter on empty line in middle splits the blockquote', async () => {
  const { user, state } = renderEditor(
    <doc>
      <blockquote>
        <paragraph>
          <text>some content</text>
        </paragraph>
        <paragraph>
          <cursor />
        </paragraph>
        <paragraph>
          <text>some content</text>
        </paragraph>
      </blockquote>
    </doc>
  )

  await user.keyboard('{Enter}')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <blockquote>
        <paragraph>
          <text>
            some content
          </text>
        </paragraph>
      </blockquote>
      <blockquote>
        <paragraph>
          <cursor />
        </paragraph>
        <paragraph>
          <text>
            some content
          </text>
        </paragraph>
      </blockquote>
    </doc>
  `)
})

test('enter on empty line at start with other non-empty paragraphs moves the start out of the blockquote', async () => {
  const { user, state } = renderEditor(
    <doc>
      <blockquote>
        <paragraph>
          <cursor />
        </paragraph>
        <paragraph>
          <text>a</text>
        </paragraph>
        <paragraph>
          <text>b</text>
        </paragraph>
      </blockquote>
    </doc>
  )

  await user.keyboard('{Enter}')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <cursor />
      </paragraph>
      <blockquote>
        <paragraph>
          <text>
            a
          </text>
        </paragraph>
        <paragraph>
          <text>
            b
          </text>
        </paragraph>
      </blockquote>
    </doc>
  `)
})
