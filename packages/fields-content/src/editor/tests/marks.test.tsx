/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { expect, test, describe } from 'vitest'
import { simpleMarkShortcuts } from '../inputrules/shortcuts'
import { jsx, redo, renderEditor, undo } from './utils'

for (const [markName, shortcuts] of simpleMarkShortcuts) {
  for (const shortcut of shortcuts) {
    describe(`${markName} with shortcut ${shortcut}`, () => {
      test('basic shortcut usage', async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <text>
                {shortcut}thing{shortcut.slice(0, -1)}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )
        await user.keyboard(`${shortcut.slice(-1)}s`)
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text {...{ [markName]: true }}>thing</text>
              <text>
                s<cursor />
              </text>
            </paragraph>
          </doc>
        )
      })
      test('single character inside shortcut', async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <text>
                {shortcut}a{shortcut.slice(0, -1)}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )
        await user.keyboard(`${shortcut.slice(-1)}s`)
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text {...{ [markName]: true }}>a</text>
              <text>
                s<cursor />
              </text>
            </paragraph>
          </doc>
        )
      })

      test('two characters inside shortcut', async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <text>
                {shortcut}ab{shortcut.slice(0, -1)}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )
        await user.keyboard(`${shortcut.slice(-1)}s`)
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text {...{ [markName]: true }}>ab</text>
              <text>
                s<cursor />
              </text>
            </paragraph>
          </doc>
        )
      })
      test('basic shortcut usage from empty', async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <cursor />
            </paragraph>
          </doc>
        )
        await user.keyboard(`${shortcut}thing${shortcut}s`)
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text {...{ [markName]: true }}>thing</text>
              <text>
                s<cursor />
              </text>
            </paragraph>
          </doc>
        )
      })

      test('works when selection is not collapsed', async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <text>
                {shortcut}thing{shortcut.slice(0, -1)}
                <anchor />
                some wonderful content
                <head />
              </text>
            </paragraph>
          </doc>
        )
        await user.keyboard(shortcut.slice(-1))
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text {...{ [markName]: true }}>
                thing
                <cursor marks={{}} />
              </text>
            </paragraph>
          </doc>
        )
      })
      const otherMark = markName === 'italic' ? 'bold' : 'italic'
      test('works when the start and ends are in different text nodes', async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <text>{shortcut}t</text>
              <text {...{ [otherMark]: true }}>hin</text>
              <text>
                g{shortcut.slice(0, -1)}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )
        await user.keyboard(shortcut.slice(-1))
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text {...{ [markName]: true }}>t</text>
              <text {...{ [otherMark]: true, [markName]: true }}>hin</text>
              <text {...{ [markName]: true }}>
                g
                <cursor marks={{}} />
              </text>
            </paragraph>
          </doc>
        )
      })
      test('does match when start of shortcut is in a different text node', async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <text {...{ [otherMark]: true }}>{shortcut}</text>
              <text>
                thing{shortcut.slice(0, -1)}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )

        await user.keyboard(shortcut.slice(-1))
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text {...{ [markName]: true }}>
                thing
                <cursor marks={{}} />
              </text>
            </paragraph>
          </doc>
        )
      })
      if (shortcut.length === 2) {
        test('matches when the end shortcut is in a different text node', async () => {
          const { state, user } = renderEditor(
            <doc>
              <paragraph>
                <text>{shortcut}thing</text>
                <text {...{ [otherMark]: true }}>
                  {shortcut.slice(0, -1)}
                  <cursor />
                </text>
              </paragraph>
            </doc>
          )

          await user.keyboard(shortcut.slice(-1))
          expect(state()).toEqual(
            <doc>
              <paragraph>
                <text {...{ [markName]: true }}>
                  thing
                  <cursor marks={{}} />
                </text>
              </paragraph>
            </doc>
          )
        })
        test('does match when first and second characters in the start shortcut are in different text nodes', async () => {
          const { state, user } = renderEditor(
            <doc>
              <paragraph>
                <text {...{ [otherMark]: true }}>{shortcut[0]}</text>
                <text>
                  {shortcut[1]}thing{shortcut.slice(0, -1)}
                  <cursor />
                </text>
              </paragraph>
            </doc>
          )

          await user.keyboard(shortcut.slice(-1))
          expect(state()).toEqual(
            <doc>
              <paragraph>
                <text {...{ [markName]: true }}>
                  thing
                  <cursor marks={{}} />
                </text>
              </paragraph>
            </doc>
          )
        })
      }
      test('matches when the shortcut appears in an invalid position after the valid position in the same text node', async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <text>
                some text {shortcut}t{shortcut}hing{shortcut.slice(0, -1)}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )

        await user.keyboard(shortcut.slice(-1))
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text>some text </text>
              <text {...{ [markName]: true }}>
                t{shortcut}hing
                <cursor marks={{}} />
              </text>
            </paragraph>
          </doc>
        )
      })

      test('does not match when there is nothing between the start and end of the shortcut', async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <text>
                {shortcut + shortcut.slice(0, -1)}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )
        await user.keyboard(shortcut.slice(-1))
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text>
                {shortcut.repeat(2)}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )
      })
      test('does not match when there is whitespace immediately after the end of the start of the shortcut', async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <text>
                {shortcut} thing{shortcut.slice(0, -1)}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )

        await user.keyboard(shortcut.slice(-1))
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text>
                {shortcut} thing{shortcut}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )
      })

      test('does not match when there is whitespace immediately before the start of the end shortcut', async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <text>
                {shortcut}thing {shortcut.slice(0, -1)}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )

        await user.keyboard(shortcut.slice(-1))
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text>
                {shortcut}thing {shortcut}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )
      })
      if (shortcut[0] === '_') {
        test('does not match if there is a non-whitespace character before the start of the shortcut', async () => {
          const { state, user } = renderEditor(
            <doc>
              <paragraph>
                <text>
                  w{shortcut}thing{shortcut.slice(0, -1)}
                  <cursor />
                </text>
              </paragraph>
            </doc>
          )

          await user.keyboard(shortcut.slice(-1))
          expect(state()).toEqual(
            <doc>
              <paragraph>
                <text>
                  w{shortcut}thing{shortcut}
                  <cursor />
                </text>
              </paragraph>
            </doc>
          )
        })
        test("does not match when there is a different text node before the start of the shortcut that doesn't end in whitespace", async () => {
          const { state, user } = renderEditor(
            <doc>
              <paragraph>
                <text {...{ [otherMark]: true }}>some text</text>
                <text>
                  {shortcut}thing{shortcut.slice(0, -1)}
                  <cursor />
                </text>
              </paragraph>
            </doc>
          )

          await user.keyboard(shortcut.slice(-1))
          expect(state()).toEqual(
            <doc>
              <paragraph>
                <text {...{ [otherMark]: true }}>some text</text>
                <text>
                  {shortcut}thing{shortcut}
                  <cursor />
                </text>
              </paragraph>
            </doc>
          )
        })
        test('matches when the shortcut appears in an invalid position before the valid position in the same text node', async () => {
          const { state, user } = renderEditor(
            <doc>
              <paragraph>
                <text>
                  some{shortcut}text {shortcut}thing{shortcut.slice(0, -1)}
                  <cursor />
                </text>
              </paragraph>
            </doc>
          )

          await user.keyboard(shortcut.slice(-1))
          expect(state()).toEqual(
            <doc>
              <paragraph>
                <text>some{shortcut}text </text>
                <text {...{ [markName]: true }}>
                  thing
                  <cursor marks={{}} />
                </text>
              </paragraph>
            </doc>
          )
        })
      }
      test('does match if there is content before the text but still whitespace before the shortcut', async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <text>
                w {shortcut}thing{shortcut.slice(0, -1)}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )

        await user.keyboard(shortcut.slice(-1))
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text>w </text>
              <text {...{ [markName]: true }}>
                thing
                <cursor marks={{}} />
              </text>
            </paragraph>
          </doc>
        )
      })
      test("does match if there's text in the same block with marks and still whitespace before the new place", async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <text bold>some text</text>
              <text>
                more {shortcut}something{shortcut.slice(0, -1)}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )

        await user.keyboard(shortcut.slice(-1))
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text bold>some text</text>
              <text>more </text>
              <text {...{ [markName]: true }}>
                something
                <cursor marks={{}} />
              </text>
            </paragraph>
          </doc>
        )
      })
      test("does match if there's lots of text in the same block with marks and still whitespace before the new place", async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <text {...{ [otherMark]: true }}>some text</text>
              <text bold>some text</text>
              <text {...{ [otherMark]: true }}>some text</text>
              <text bold>some text</text>
              <text {...{ [otherMark]: true }}>some text</text>
              <text bold>some text</text>
              <text {...{ [otherMark]: true }}>some text</text>
              <text bold>some text</text>
              <text {...{ [otherMark]: true }}>some text</text>
              <text bold>some text</text>
              <text {...{ [otherMark]: true }}>some text</text>
              <text bold>some text</text>
              <text {...{ [otherMark]: true }}>some text</text>
              <text bold>some text</text>
              <text>
                more {shortcut}something{shortcut.slice(0, -1)}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )

        await user.keyboard(shortcut.slice(-1))
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text {...{ [otherMark]: true }}>some text</text>
              <text bold>some text</text>
              <text {...{ [otherMark]: true }}>some text</text>
              <text bold>some text</text>
              <text {...{ [otherMark]: true }}>some text</text>
              <text bold>some text</text>
              <text {...{ [otherMark]: true }}>some text</text>
              <text bold>some text</text>
              <text {...{ [otherMark]: true }}>some text</text>
              <text bold>some text</text>
              <text {...{ [otherMark]: true }}>some text</text>
              <text bold>some text</text>
              <text {...{ [otherMark]: true }}>some text</text>
              <text bold>some text</text>
              <text>more </text>
              <text {...{ [markName]: true }}>
                something
                <cursor marks={{}} />
              </text>
            </paragraph>
          </doc>
        )
      })

      test('undo only undos adding the mark and removing the shortcut, keeps the inserted text', async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <text>
                {shortcut}something{shortcut.slice(0, -1)}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )

        await user.keyboard(shortcut.slice(-1))
        await undo(user)
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text>
                {shortcut}something{shortcut}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )
      })
      test('redo works', async () => {
        const { state, user } = renderEditor(
          <doc>
            <paragraph>
              <text>
                {shortcut}something{shortcut.slice(0, -1)}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )

        await user.keyboard(shortcut.slice(-1))

        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text {...{ [markName]: true }}>
                something
                <cursor marks={{}} />
              </text>
            </paragraph>
          </doc>
        )
        await undo(user)
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text>
                {shortcut}something{shortcut}
                <cursor />
              </text>
            </paragraph>
          </doc>
        )
        await redo(user)
        // note the lack of marks={{}} on the cursor after redoing it
        // this isn't ideal but whatever
        expect(state()).toEqual(
          <doc>
            <paragraph>
              <text {...{ [markName]: true }}>
                something
                <cursor />
              </text>
            </paragraph>
          </doc>
        )
      })
    })
  }
}

test('inserting a break at the end of a block with a mark removes the mark', async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text bold>
          some content
          <cursor />
        </text>
      </paragraph>
    </doc>
  )

  await user.keyboard('{Enter}a')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          bold={true}
        >
          some content
        </text>
      </paragraph>
      <paragraph>
        <text>
          a
          <cursor />
        </text>
      </paragraph>
    </doc>
  `)
})

test("inserting a break in the middle of text doesn't remove the mark", async () => {
  const { state, user } = renderEditor(
    <doc>
      <paragraph>
        <text bold>
          some <cursor /> content
        </text>
      </paragraph>
    </doc>
  )
  await user.keyboard('{Enter}a')
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <paragraph>
        <text
          bold={true}
        >
          some 
        </text>
      </paragraph>
      <paragraph>
        <text
          bold={true}
        >
          a
          <cursor />
           content
        </text>
      </paragraph>
    </doc>
  `)
})
