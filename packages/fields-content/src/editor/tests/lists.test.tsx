/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { expect, test } from 'vitest'
import { jsx, renderEditor } from '../tests/utils'

test('ordered list shortcut', async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text>
          1.
          <cursor />
        </text>
      </paragraph>
    </doc>
  )

  await user.keyboard(' ')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <ordered_list
        start={1}
      >
        <list_item>
          <paragraph>
            <cursor />
          </paragraph>
        </list_item>
      </ordered_list>
    </doc>
  `)
})

test('ordered list shortcut with different start', async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text>
          5.
          <cursor />
        </text>
      </paragraph>
    </doc>
  )

  await user.keyboard(' ')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <ordered_list
        start={5}
      >
        <list_item>
          <paragraph>
            <cursor />
          </paragraph>
        </list_item>
      </ordered_list>
    </doc>
  `)
})

test('unordered list shortcut - ', async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text>
          -
          <cursor />
        </text>
      </paragraph>
    </doc>
  )

  await user.keyboard(' ')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <cursor />
          </paragraph>
        </list_item>
      </unordered_list>
    </doc>
  `)
})

test('unordered list shortcut * ', async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text>
          *
          <cursor />
        </text>
      </paragraph>
    </doc>
  )

  await user.keyboard(' ')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <cursor />
          </paragraph>
        </list_item>
      </unordered_list>
    </doc>
  `)
})

test('inserting a break on end of list in empty list item exits list', async () => {
  const { state, user } = renderEditor(
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>some text</text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <cursor />
          </paragraph>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  )

  await user.keyboard('{Enter}')

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              some text
            </text>
          </paragraph>
        </list_item>
      </unordered_list>
      <paragraph>
        <cursor />
      </paragraph>
      <paragraph />
    </doc>
  `)
})

test('inserting a break in empty list item in the middle of a list splits and exits', async () => {
  const { state, user } = renderEditor(
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>some text</text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <cursor />
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>some text</text>
          </paragraph>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  )

  await user.keyboard('{Enter}')

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              some text
            </text>
          </paragraph>
        </list_item>
      </unordered_list>
      <paragraph>
        <cursor />
      </paragraph>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              some text
            </text>
          </paragraph>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  `)
})

test('toggle list on empty line', async () => {
  const { state, user, rendered } = renderEditor(
    <doc>
      <paragraph>
        <cursor />
      </paragraph>
      <paragraph />
    </doc>
  )

  await user.click(rendered.getByLabelText('Numbered list'))

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <ordered_list
        start={1}
      >
        <list_item>
          <paragraph>
            <cursor />
          </paragraph>
        </list_item>
      </ordered_list>
      <paragraph />
    </doc>
  `)
})

test('toggle list on line with text', async () => {
  const { state, user, rendered } = renderEditor(
    <doc>
      <paragraph>
        <text>
          some text
          <cursor />
        </text>
      </paragraph>
      <paragraph />
    </doc>
  )

  await user.click(rendered.getByLabelText('Numbered list'))

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <ordered_list
        start={1}
      >
        <list_item>
          <paragraph>
            <text>
              some text
              <cursor />
            </text>
          </paragraph>
        </list_item>
      </ordered_list>
      <paragraph />
    </doc>
  `)
})

test('toggle list on line with text with marks', async () => {
  const { state, user, rendered } = renderEditor(
    <doc>
      <paragraph>
        <text>
          some text. <cursor />
        </text>
        <text bold>this is bold.</text>
        <text> this is not bold again</text>
      </paragraph>
      <paragraph />
    </doc>
  )

  await user.click(rendered.getByLabelText('Numbered list'))

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <ordered_list
        start={1}
      >
        <list_item>
          <paragraph>
            <text>
              some text. 
              <cursor />
            </text>
            <text
              bold={true}
            >
              <cursor />
              this is bold.
            </text>
            <text>
               this is not bold again
            </text>
          </paragraph>
        </list_item>
      </ordered_list>
      <paragraph />
    </doc>
  `)
})

test('toggle list on list with text with marks', async () => {
  const { state, user, rendered } = renderEditor(
    <doc>
      <ordered_list>
        <list_item>
          <paragraph>
            <text>
              some text.
              <cursor />
            </text>
            <text bold>this is bold.</text>
            <text>this is not bold again</text>
          </paragraph>
        </list_item>
      </ordered_list>
      <paragraph />
    </doc>
  )

  await user.click(rendered.getByLabelText('Numbered list'))

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          some text.
          <cursor />
        </text>
        <text
          bold={true}
        >
          <cursor />
          this is bold.
        </text>
        <text>
          this is not bold again
        </text>
      </paragraph>
      <paragraph />
    </doc>
  `)
})

test('toggle ordered_list inside of ordered_list', async () => {
  const { state, user, rendered } = renderEditor(
    <doc>
      <ordered_list>
        <list_item>
          <paragraph>
            <text>
              some text
              <cursor />
            </text>
          </paragraph>
        </list_item>
      </ordered_list>
      <paragraph />
    </doc>
  )

  await user.click(rendered.getByLabelText('Numbered list'))

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          some text
          <cursor />
        </text>
      </paragraph>
      <paragraph />
    </doc>
  `)
})

test('toggle ordered_list inside of multi-item ordered_list', async () => {
  const { state, user, rendered } = renderEditor(
    <doc>
      <ordered_list>
        <list_item>
          <paragraph>
            <text>some text</text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>
              some more text
              <cursor />
            </text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>even more text</text>
          </paragraph>
        </list_item>
      </ordered_list>
      <paragraph />
    </doc>
  )

  await user.click(rendered.getByLabelText('Numbered list'))

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <ordered_list
        start={1}
      >
        <list_item>
          <paragraph>
            <text>
              some text
            </text>
          </paragraph>
        </list_item>
      </ordered_list>
      <paragraph>
        <text>
          some more text
          <cursor />
        </text>
      </paragraph>
      <ordered_list
        start={1}
      >
        <list_item>
          <paragraph>
            <text>
              even more text
            </text>
          </paragraph>
        </list_item>
      </ordered_list>
      <paragraph />
    </doc>
  `)
})

test('toggle unordered_list inside of single item in multi-item ordered_list', async () => {
  const { state, user, rendered } = renderEditor(
    <doc>
      <ordered_list>
        <list_item>
          <paragraph>
            <text>some text</text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>
              some more text
              <cursor />
            </text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>even more text</text>
          </paragraph>
        </list_item>
      </ordered_list>
      <paragraph />
    </doc>
  )

  await user.click(rendered.getByLabelText('Bullet list'))

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              some text
            </text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>
              some more text
              <cursor />
            </text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>
              even more text
            </text>
          </paragraph>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  `)
})

test('toggle unordered_list for all items in multi-item ordered_list', async () => {
  const { state, user, rendered } = renderEditor(
    <doc>
      <ordered_list>
        <list_item>
          <paragraph>
            <text>
              <anchor />
              some text
            </text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>some more text</text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>
              even more text
              <head />
            </text>
          </paragraph>
        </list_item>
      </ordered_list>
      <paragraph />
    </doc>
  )

  await user.click(rendered.getByLabelText('Bullet list'))

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              <anchor />
              some text
            </text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>
              some more text
            </text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>
              even more text
              <head />
            </text>
          </paragraph>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  `)
})

test('backspace at start of list only unwraps the first item', async () => {
  const { state, user } = renderEditor(
    <doc>
      <ordered_list>
        <list_item>
          <paragraph>
            <text>
              <cursor />
              some text
            </text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>some more text</text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>even more text</text>
          </paragraph>
        </list_item>
      </ordered_list>
      <paragraph />
    </doc>
  )

  await user.keyboard('{Backspace}')

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text>
          <cursor />
          some text
        </text>
      </paragraph>
      <ordered_list
        start={1}
      >
        <list_item>
          <paragraph>
            <text>
              some more text
            </text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>
              even more text
            </text>
          </paragraph>
        </list_item>
      </ordered_list>
      <paragraph />
    </doc>
  `)
})

test('nest list', async () => {
  const { state, user } = renderEditor(
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>some text</text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <text>
              content
              <cursor />
            </text>
          </paragraph>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  )

  await user.keyboard('{Tab}')
  // all these extra nest calls should do nothing
  await user.keyboard('{Tab}')
  await user.keyboard('{Tab}')
  await user.keyboard('{Tab}')
  await user.keyboard('{Tab}')
  await user.keyboard('{Tab}')
  await user.keyboard('{Tab}')

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              some text
            </text>
          </paragraph>
          <unordered_list>
            <list_item>
              <paragraph>
                <text>
                  content
                  <cursor />
                </text>
              </paragraph>
            </list_item>
          </unordered_list>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  `)
})

test('nest list when previous thing is nested', async () => {
  const { state, user } = renderEditor(
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>some text</text>
          </paragraph>
          <unordered_list>
            <list_item>
              <paragraph>
                <text>some more text</text>
              </paragraph>
            </list_item>
          </unordered_list>
        </list_item>
        <list_item>
          <paragraph>
            <text>
              content
              <cursor />
            </text>
          </paragraph>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  )

  await user.keyboard('{Tab}')

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              some text
            </text>
          </paragraph>
          <unordered_list>
            <list_item>
              <paragraph>
                <text>
                  some more text
                </text>
              </paragraph>
            </list_item>
            <list_item>
              <paragraph>
                <text>
                  content
                  <cursor />
                </text>
              </paragraph>
            </list_item>
          </unordered_list>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  `)
})

test('inserting a break on end of list non-empty list item adds a new list item', async () => {
  const { state, user } = renderEditor(
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              some text
              <cursor />
            </text>
          </paragraph>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  )

  await user.keyboard('{Enter}')

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              some text
            </text>
          </paragraph>
        </list_item>
        <list_item>
          <paragraph>
            <cursor />
          </paragraph>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  `)
})

test('changing the type of a nested list', async () => {
  const { state, user, rendered } = renderEditor(
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>some text</text>
          </paragraph>
          <unordered_list>
            <list_item>
              <paragraph>
                <text>
                  inner text
                  <cursor />
                </text>
              </paragraph>
            </list_item>
          </unordered_list>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  )
  await user.click(rendered.getByLabelText('Numbered list'))

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              some text
            </text>
          </paragraph>
          <ordered_list
            start={1}
          >
            <list_item>
              <paragraph>
                <text>
                  inner text
                  <cursor />
                </text>
              </paragraph>
            </list_item>
          </ordered_list>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  `)
})

test('changing the type of a nested list to something which it is nested inside', async () => {
  const { state, user, rendered } = renderEditor(
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>top text</text>
          </paragraph>
          <ordered_list>
            <list_item>
              <paragraph>
                <text>middle text</text>
              </paragraph>
              <unordered_list>
                <list_item>
                  <paragraph>
                    <text>
                      inner text
                      <cursor />
                    </text>
                  </paragraph>
                </list_item>
              </unordered_list>
            </list_item>
          </ordered_list>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  )
  await user.click(rendered.getByLabelText('Numbered list'))

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              top text
            </text>
          </paragraph>
          <ordered_list
            start={1}
          >
            <list_item>
              <paragraph>
                <text>
                  middle text
                </text>
              </paragraph>
              <ordered_list
                start={1}
              >
                <list_item>
                  <paragraph>
                    <text>
                      inner text
                      <cursor />
                    </text>
                  </paragraph>
                </list_item>
              </ordered_list>
            </list_item>
          </ordered_list>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  `)
})

// TODO: fix this
// eslint-disable-next-line jest/no-disabled-tests
test.skip('nesting a list item in an ordered list into an unordered list makes the item unordered', async () => {
  const { state, user } = renderEditor(
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>first</text>
          </paragraph>
          <ordered_list>
            <list_item>
              <paragraph>
                <text>second</text>
              </paragraph>
            </list_item>
          </ordered_list>
        </list_item>
        <list_item>
          <paragraph>
            <text>
              third
              <cursor />
            </text>
          </paragraph>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  )

  await user.keyboard('{Tab}')

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <unordered_list>
        <list_item>
          <paragraph>
            <text>
              first
            </text>
          </paragraph>
          <ordered_list>
            <list_item>
              <paragraph>
                <text>
                  second
                </text>
              </paragraph>
            </list_item>
            <list_item>
              <paragraph>
                <text>
                  third
                  <cursor />
                </text>
              </paragraph>
            </list_item>
          </ordered_list>
        </list_item>
      </unordered_list>
      <paragraph />
    </doc>
  `)
})

// TODO: fix this(the snapshot shows the correct output)
// eslint-disable-next-line jest/no-disabled-tests
test.skip('toggling unordered_list in a nested unordered_list moves the list item out of the list', async () => {
  const { state, user, rendered } = renderEditor(
    <doc>
      <ordered_list>
        <list_item>
          <paragraph>
            <text>first</text>
          </paragraph>
          <unordered_list>
            <list_item>
              <paragraph>
                <text>
                  second
                  <cursor />
                </text>
              </paragraph>
            </list_item>
          </unordered_list>
        </list_item>
      </ordered_list>
      <paragraph />
    </doc>
  )
  await user.click(rendered.getByLabelText('Bullet list'))

  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <ordered_list>
        <list_item>
          <paragraph>
            <text>
              first
            </text>
          </paragraph>
        </list_item>
      </ordered_list>
      <paragraph>
        <text>
          second
          <cursor />
        </text>
      </paragraph>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </doc>
  `)
})

// TODO: fix this
// eslint-disable-next-line jest/no-disabled-tests
test.skip('nesting multiple items at the same time works', async () => {
  const { state, user } = renderEditor(
    <doc>
      <ordered_list>
        <list_item>
          <paragraph>
            <text>text</text>
          </paragraph>
          <unordered_list>
            <list_item>
              <paragraph>
                <text>text</text>
              </paragraph>
            </list_item>
            <list_item>
              <paragraph>
                <text>
                  <anchor />
                  text
                </text>
              </paragraph>
            </list_item>
            <list_item>
              <paragraph>
                <text>
                  text
                  <head />
                </text>
              </paragraph>
            </list_item>
          </unordered_list>
        </list_item>
      </ordered_list>
      <paragraph />
    </doc>
  )
  await user.keyboard('{Tab}')

  expect(state()).toMatchInlineSnapshot(``)
})
