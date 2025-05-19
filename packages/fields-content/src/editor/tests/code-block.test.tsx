/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { expect, test } from 'vitest'
import { jsx, renderEditor } from './utils'

const basicDoc = (
  <doc>
    <paragraph>
      <cursor />
    </paragraph>
  </doc>
)

for (const type of [' ', '{Enter}'] as const) {
  test(`inserting a code block with a shortcut ending with a ${type}`, async () => {
    const { state, user } = renderEditor(basicDoc)
    await user.keyboard(`\`\`\`${type}some content`)
    expect(state()).toEqual(
      <doc>
        <code_block language="">
          <text>
            some content
            <cursor />
          </text>
        </code_block>
      </doc>
    )
  })
  test(`inserting a code block with a shortcut with a known language with a ${type}`, async () => {
    const { state, user } = renderEditor(basicDoc)
    await user.keyboard(`\`\`\`js${type}some content`)
    expect(state()).toEqual(
      <doc>
        <code_block language="js">
          <text>
            some content
            <cursor />
          </text>
        </code_block>
      </doc>
    )
  })
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip(`inserting a code block with an unknown language a shortcut ending with a ${type}`, async () => {
    const { state, user } = renderEditor(basicDoc)
    await user.keyboard(`\`\`\`asdasdasdasdasdfasdfasdf${type}some content`)

    expect(state()).toEqual(
      <doc>
        <code_block language="asdasdasdasdasdfasdfasdf">
          <text>
            some content
            <cursor />
          </text>
        </code_block>
      </doc>
    )
  })
}

test('enter inserts a new line', async () => {
  const { user, state } = renderEditor(
    <doc>
      <code_block language="">
        <text>
          {'asdkjnajsndakjndkjnaksdjnasdasdasd'}
          <cursor />
        </text>
      </code_block>
    </doc>
  )

  await user.keyboard('{Enter}some text')

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <code_block
        language=""

      >
        <text>
          asdkjnajsndakjndkjnaksdjnasdasdasd
    some text
          <cursor />
        </text>
      </code_block>
    </doc>
  `)
})

test('insertBreak when at end with \n as last character just adds a new line', async () => {
  const { user, state } = renderEditor(
    <doc>
      <code_block language="">
        <text>
          {'asdkjnajsndakjndkjnaksdjn\nasdasdasd\n'}
          <cursor />
        </text>
      </code_block>
    </doc>
  )

  await user.keyboard('{Enter}')

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <code_block
        language=""

      >
        <text>
          asdkjnajsndakjndkjnaksdjn
    asdasdasd


          <cursor />
        </text>
      </code_block>
    </doc>
  `)
})

test('shift+enter in the middle of a code block splits it', async () => {
  const { state, user } = renderEditor(
    <doc>
      <code_block language="">
        <text>
          some text
          <cursor />
          {'more text\n'}
        </text>
      </code_block>
    </doc>
  )

  await user.keyboard('{Shift>}{Enter}{/Shift}')

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <code_block
        language=""

      >
        <text>
          some text
        </text>
      </code_block>
      <code_block
        language=""

      >
        <text>
          <cursor />
          more text

        </text>
      </code_block>
    </doc>
  `)
})

test('shift+enter at the end of a code block inserts a paragraph after', async () => {
  const { state, user } = renderEditor(
    <doc>
      <code_block language="">
        <text>
          some text
          {'more text\n'}
          <cursor />
        </text>
      </code_block>
    </doc>
  )

  await user.keyboard('{Shift>}{Enter}{/Shift}')

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <code_block
        language=""

      >
        <text>
          some textmore text

        </text>
      </code_block>
      <paragraph>
        <cursor />
      </paragraph>
    </doc>
  `)
})

test('shift+enter at the start of a code block inserts a paragraph before', async () => {
  const { state, user } = renderEditor(
    <doc>
      <code_block language="">
        <text>
          <cursor />
          some text
          {'more text\n'}
        </text>
      </code_block>
    </doc>
  )

  await user.keyboard('{Shift>}{Enter}{/Shift}')

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph />
      <code_block
        language=""

      >
        <text>
          <cursor />
          some textmore text

        </text>
      </code_block>
    </doc>
  `)
})

test('code block button is disabled when selection is around a divider', () => {
  const { rendered } = renderEditor(
    <doc>
      <node_selection>
        <divider />
      </node_selection>
    </doc>
  )

  const button = rendered.getByLabelText('Code block')

  expect(button).toBeDisabled()
})

test('code block button is enabled and not pressed when in paragraph', () => {
  const { rendered } = renderEditor(
    <doc>
      <paragraph>
        <cursor />
      </paragraph>
      <code_block language="" />
    </doc>
  )

  const button = rendered.getByLabelText('Code block')
  expect(button).toBeEnabled()
  expect(button).toHaveAttribute('aria-pressed', 'false')
})

test('clicking on the code block button converts the current nodes to code blocks', async () => {
  const { rendered, user, state } = renderEditor(
    <doc>
      <paragraph>
        <text>
          blah
          <anchor />
        </text>
      </paragraph>
      <paragraph>
        <text>more</text>
      </paragraph>
      <heading level={1}>
        <text>
          more
          <head />
        </text>
      </heading>
    </doc>
  )

  const button = rendered.getByLabelText('Code block')
  expect(button).toBeEnabled()
  expect(button).toHaveAttribute('aria-pressed', 'false')
  await user.click(button)
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <code_block
        language=""

      >
        <text>
          blah
          <anchor />
        </text>
      </code_block>
      <code_block
        language=""

      >
        <text>
          more
        </text>
      </code_block>
      <code_block
        language=""

      >
        <text>
          more
          <head />
        </text>
      </code_block>
    </doc>
  `)
})

test('clicking the code block button while the selection is contains code blocks converts only the code blocks to paragraphs', async () => {
  const content = (Type: 'code_block' | 'paragraph') => {
    const stuff =
      Type === 'code_block' ? (
        <Type language="">
          <text>something</text>
        </Type>
      ) : (
        <Type>
          <text>something</text>
        </Type>
      )
    return (
      <doc>
        <paragraph>
          <text>
            blah <anchor />
          </text>
        </paragraph>
        {stuff}
        <paragraph>
          <text>more</text>
        </paragraph>
        {stuff}
        <heading level={1}>
          <text>more</text>
        </heading>
        <paragraph>
          <text>more</text>
        </paragraph>
        <paragraph>
          <text>
            more
            <head />
          </text>
        </paragraph>
      </doc>
    )
  }
  const { rendered, user, state } = renderEditor(content('code_block'))

  const button = rendered.getByLabelText('Code block')
  expect(button).toBeEnabled()
  expect(button).toHaveAttribute('aria-pressed', 'true')
  await user.click(button)
  expect(state()).toEqual(content('paragraph'))
})

test('clicking the code block while the selection is within a code block converts it to a paragraph', async () => {
  const content = (Type: 'code_block' | 'paragraph') => (
    <doc>
      {Type === 'code_block' ? (
        <Type language="">
          <text>
            some
            <cursor />
            thing
          </text>
        </Type>
      ) : (
        <Type>
          <text>
            some
            <cursor />
            thing
          </text>
        </Type>
      )}
      <heading level={1}>
        <text>more</text>
      </heading>
      <paragraph>
        <text>more</text>
      </paragraph>
    </doc>
  )
  const { rendered, user, state } = renderEditor(content('code_block'))

  const button = rendered.getByLabelText('Code block')
  expect(button).toBeEnabled()
  expect(button).toHaveAttribute('aria-pressed', 'true')
  await user.click(button)
  expect(state()).toEqual(content('paragraph'))
})
