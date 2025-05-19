/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { expect, test } from 'vitest'
import { jsx, renderEditor, undo } from './utils'

test('basic link shortcut', async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text>
          [content](https://keystonejs.com
          <cursor />
        </text>
      </paragraph>
    </doc>
  )
  await user.keyboard(')')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          content
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test('link shortcut with content before it and whitespace directly before it works', async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text>
          asdasd asd [content](https://keystonejs.com
          <cursor />
        </text>
      </paragraph>
    </doc>
  )
  await user.keyboard(')')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          asdasd asd 
        </text>
        <text
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          content
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test('link shortcut with content before it and no whitespace directly before it works', async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text>
          asdasd asd[content](https://keystonejs.com
          <cursor />
        </text>
      </paragraph>
    </doc>
  )
  await user.keyboard(')')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          asdasd asd
        </text>
        <text
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          content
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test('shortcut with whitespace in the middle of the content works', async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text>
          [content more stuff](https://keystonejs.com
          <cursor />
        </text>
      </paragraph>
    </doc>
  )
  await user.keyboard(')')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          content more stuff
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test('link shortcut then typing inserts text outside of the link', async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text>
          [content](https://keystonejs.com
          <cursor />
        </text>
      </paragraph>
    </doc>
  )
  await user.keyboard(')content')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          content
        </text>
        <text>
          content
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test('link shortcut with bold in some of the content works', async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text>[co</text>
        <text bold>nt</text>
        <text>
          ent](https://keystonejs.com
          <cursor />
        </text>
      </paragraph>
    </doc>
  )
  await user.keyboard(')')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          co
        </text>
        <text
          bold={true}
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          nt
        </text>
        <text
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          ent
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test('an undo only reverts to the whole shortcut text', async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text>
          [content](https://keystonejs.com
          <cursor />
        </text>
      </paragraph>
    </doc>
  )
  await user.keyboard(')')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          content
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
  await undo(user)
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          [content](https://keystonejs.com)
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test("text after the markdown shortcut isn't included in the link text", async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text>
          [content](https://keystonejs.com
          <cursor /> blah blah
        </text>
      </paragraph>
    </doc>
  )
  await user.keyboard(')')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          content
          <cursor />
        </text>
        <text>
          <cursor />
           blah blah
        </text>
      </paragraph>
    </doc>
  `)
})
