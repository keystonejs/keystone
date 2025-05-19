/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { expect, test } from 'vitest'
import { renderEditor, jsx } from '../utils'
import { plainTextDataTransfer } from './utils'

test('pasting a url on some text wraps the text with a link', async () => {
  const { user, state } = renderEditor(
    <doc>
      <paragraph>
        <text>
          blah <anchor />
          blah
          <head /> blah
        </text>
      </paragraph>
    </doc>
  )
  await user.paste(plainTextDataTransfer('https://keystonejs.com'))
  expect(state()).toMatchInlineSnapshot(`
<doc>
  <paragraph>
    <text>
      blah 
      <anchor />
    </text>
    <text
      link={
        {
          "href": "https://keystonejs.com",
          "title": "",
        }
      }
    >
      <anchor />
      blah
      <head />
    </text>
    <text>
      <head />
       blah
    </text>
  </paragraph>
</doc>
`)
})

test('pasting a url on a selection spanning multiple blocks replaces the selection with the url', async () => {
  const { user, state } = renderEditor(
    <doc>
      <paragraph>
        <text>
          start should still exist <anchor />
          blah blah
        </text>
      </paragraph>
      <paragraph>
        <text>
          blah blah
          <head /> end should still exist
        </text>
      </paragraph>
    </doc>
  )
  await user.paste(plainTextDataTransfer('https://keystonejs.com'))
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          start should still exist 
        </text>
        <text
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          https://keystonejs.com
          <cursor />
        </text>
        <text>
          <cursor />
           end should still exist
        </text>
      </paragraph>
    </doc>
  `)
})

test('pasting a url on a selection with a link inside replaces the selection with the url', async () => {
  const { user, state } = renderEditor(
    <doc>
      <paragraph>
        <text>
          start should still exist <anchor />
          should{' '}
        </text>
        <text
          link={{
            href: 'https://keystonejs.com/docs',
            title: '',
          }}
        >
          be
        </text>
        <text>
          replaced
          <head /> end should still exist
        </text>
      </paragraph>
    </doc>
  )
  await user.paste(plainTextDataTransfer('https://keystonejs.com'))
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          start should still exist 
        </text>
        <text
          link={
            {
              "href": "https://keystonejs.com",
              "title": "",
            }
          }
        >
          https://keystonejs.com
          <cursor />
        </text>
        <text>
          <cursor />
           end should still exist
        </text>
      </paragraph>
    </doc>
  `)
})
