/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { expect, test } from 'vitest'
import { jsx, renderEditor } from './utils'

test('basic cursor snapshot', () => {
  expect(
    <doc>
      <paragraph>
        <cursor />
      </paragraph>
    </doc>
  ).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <cursor />
      </paragraph>
    </doc>
  `)
})

test('anchor in empty paragraph', () => {
  expect(
    <doc>
      <paragraph>
        <anchor />
      </paragraph>
      <paragraph>
        <text>
          a<head />b
        </text>
      </paragraph>
    </doc>
  ).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <anchor />
      </paragraph>
      <paragraph>
        <text>
          a
          <head />
          b
        </text>
      </paragraph>
    </doc>
  `)
})

test('head in empty paragraph', () => {
  expect(
    <doc>
      <paragraph>
        <head />
      </paragraph>
      <paragraph>
        <text>
          a<anchor />b
        </text>
      </paragraph>
    </doc>
  ).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <head />
      </paragraph>
      <paragraph>
        <text>
          a
          <anchor />
          b
        </text>
      </paragraph>
    </doc>
  `)
})

test('cursor between dividers', () => {
  expect(
    <doc>
      <divider />
      <gap_cursor />
      <divider />
    </doc>
  ).toMatchInlineSnapshot(`
    <doc>
      <divider />
      <gap_cursor />
      <divider />
    </doc>
  `)
})

test('cursor before dividers', () => {
  expect(
    <doc>
      <gap_cursor />
      <divider />
      <divider />
    </doc>
  ).toMatchInlineSnapshot(`
    <doc>
      <gap_cursor />
      <divider />
      <divider />
    </doc>
  `)
})

test('cursor after dividers', () => {
  expect(
    <doc>
      <divider />
      <divider />
      <gap_cursor />
    </doc>
  ).toMatchInlineSnapshot(`
    <doc>
      <divider />
      <divider />
      <gap_cursor />
    </doc>
  `)
})

test('selection around divider with divider after', () => {
  expect(
    <doc>
      <node_selection>
        <divider />
      </node_selection>
      <divider />
    </doc>
  ).toMatchInlineSnapshot(`
    <doc>
      <node_selection>
        <divider />
      </node_selection>
      <divider />
    </doc>
  `)
})

test('selection around divider with nothing else', () => {
  expect(
    <doc>
      <node_selection>
        <divider />
      </node_selection>
    </doc>
  ).toMatchInlineSnapshot(`
    <doc>
      <node_selection>
        <divider />
      </node_selection>
    </doc>
  `)
})

test('basic cursor snapshot with content', () => {
  expect(
    <doc>
      <paragraph>
        <text>
          some
          <cursor />
          thing
        </text>
      </paragraph>
    </doc>
  ).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          some
          <cursor />
          thing
        </text>
      </paragraph>
    </doc>
  `)
})

test('basic snapshot with non-empty selection with anchor first', () => {
  expect(
    <doc>
      <paragraph>
        <text>
          so
          <anchor />
          me
          <head />
          thing
        </text>
      </paragraph>
    </doc>
  ).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          so
          <anchor />
          me
          <head />
          thing
        </text>
      </paragraph>
    </doc>
  `)
})

test('basic snapshot with non-empty selection with head first', () => {
  expect(
    <doc>
      <paragraph>
        <text>
          so
          <head />
          me
          <anchor />
          thing
        </text>
      </paragraph>
    </doc>
  ).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          so
          <head />
          me
          <anchor />
          thing
        </text>
      </paragraph>
    </doc>
  `)
})

test('basic snapshot with non-empty selection with head and anchor in different nodes', () => {
  expect(
    <doc>
      <paragraph>
        <text>
          some
          <head />
          thing
        </text>
      </paragraph>
      <paragraph>
        <text>
          another
          <anchor />
          thing
        </text>
      </paragraph>
    </doc>
  ).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          some
          <head />
          thing
        </text>
      </paragraph>
      <paragraph>
        <text>
          another
          <anchor />
          thing
        </text>
      </paragraph>
    </doc>
  `)
})

test('editor equality match', () => {
  expect(
    <doc>
      <paragraph>
        <cursor />
      </paragraph>
    </doc>
  ).toEqual(
    <doc>
      <paragraph>
        <cursor />
      </paragraph>
    </doc>
  )
})

test('editor equality mismatch', () => {
  expect(() =>
    expect(
      <doc>
        <paragraph>
          <text>
            some text
            <cursor />
          </text>
        </paragraph>
      </doc>
    ).toEqual(
      <doc>
        <paragraph>
          <cursor />
        </paragraph>
      </doc>
    )
  ).toThrow()
})

test('editor equality mismatch with only a different selection', () => {
  expect(() =>
    expect(
      <doc>
        <paragraph>
          <text>
            some
            <cursor />
            text
          </text>
        </paragraph>
      </doc>
    ).toEqual(
      <doc>
        <paragraph>
          <text>
            som
            <cursor />
            etext
          </text>
        </paragraph>
      </doc>
    )
  ).toThrow()
})

test('cursor in the middle of text', () => {
  expect(
    <doc>
      <paragraph>
        <text>
          some
          <cursor />
          text
        </text>
      </paragraph>
    </doc>
  ).toMatchInlineSnapshot(`
      <doc>
        <paragraph>
          <text>
            some
            <cursor />
            text
          </text>
        </paragraph>
      </doc>
    `)
})

test('cursor at start of text', () => {
  expect(
    <doc>
      <paragraph>
        <text>
          <cursor />
          some text
        </text>
      </paragraph>
    </doc>
  ).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          <cursor />
          some text
        </text>
      </paragraph>
    </doc>
  `)
})

test('cursor at end of text', () => {
  expect(
    <doc>
      <paragraph>
        <text>
          some text
          <cursor />
        </text>
      </paragraph>
    </doc>
  ).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          some text
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test('anchor in middle, head at end', () => {
  expect(
    <doc>
      <paragraph>
        <text>
          some
          <anchor />
          text
          <head />
        </text>
      </paragraph>
    </doc>
  ).toMatchInlineSnapshot(`
      <doc>
        <paragraph>
          <text>
            some
            <anchor />
            text
            <head />
          </text>
        </paragraph>
      </doc>
  `)
})

test('cursor split in the same text to end with anchor first', () => {
  expect(
    <doc>
      <paragraph>
        <text>
          some
          <anchor />
          text
          <head />
        </text>
      </paragraph>
    </doc>
  ).toMatchInlineSnapshot(`
      <doc>
        <paragraph>
          <text>
            some
            <anchor />
            text
            <head />
          </text>
        </paragraph>
      </doc>
    `)
})

test('cursor split in the same text to end with head first', () => {
  expect(
    <doc>
      <paragraph>
        <text>
          some
          <head />
          text
          <anchor />
        </text>
      </paragraph>
    </doc>
  ).toMatchInlineSnapshot(`
      <doc>
        <paragraph>
          <text>
            some
            <head />
            text
            <anchor />
          </text>
        </paragraph>
      </doc>
    `)
})

test('cursor split in different text with anchor first', () => {
  expect(
    <doc>
      <paragraph>
        <text>
          some
          <anchor />
          text
        </text>
      </paragraph>
      <paragraph>
        <text>
          somete
          <head />
          xt
        </text>
      </paragraph>
    </doc>
  ).toMatchInlineSnapshot(`
      <doc>
        <paragraph>
          <text>
            some
            <anchor />
            text
          </text>
        </paragraph>
        <paragraph>
          <text>
            somete
            <head />
            xt
          </text>
        </paragraph>
      </doc>
    `)
})

test('cursor split in different text with head first', () => {
  expect(
    <doc>
      <paragraph>
        <text>
          some
          <head />
          text
        </text>
      </paragraph>
      <paragraph>
        <text>
          somete
          <anchor />
          xt
        </text>
      </paragraph>
    </doc>
  ).toMatchInlineSnapshot(`
      <doc>
        <paragraph>
          <text>
            some
            <head />
            text
          </text>
        </paragraph>
        <paragraph>
          <text>
            somete
            <anchor />
            xt
          </text>
        </paragraph>
      </doc>
    `)
})

test("throws on input that doesn't conform to the schema", () => {
  expect(() =>
    renderEditor(
      <doc>
        <paragraph>
          <paragraph>
            <text>
              some
              <cursor />
              text
            </text>
          </paragraph>
        </paragraph>
      </doc>
    )
  ).toThrowErrorMatchingInlineSnapshot(
    `"Invalid content for node paragraph: <paragraph("sometext")>"`
  )
})

test('delete backward', async () => {
  let { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text>
          some
          <cursor />
          text
        </text>
      </paragraph>
    </doc>
  )
  await user.keyboard('{Backspace}')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          som
          <cursor />
          text
        </text>
      </paragraph>
    </doc>
  `)
})
