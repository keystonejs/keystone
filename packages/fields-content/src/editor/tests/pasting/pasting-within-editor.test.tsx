/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { expect, test } from 'vitest'
import { renderEditor, jsx } from '../utils'

test('blockquote pasting', async () => {
  let dataTransfer
  {
    const { user } = renderEditor(
      <doc>
        <blockquote>
          <paragraph>
            <text>
              <anchor />a
            </text>
          </paragraph>
        </blockquote>
        <blockquote>
          <paragraph>
            <text>b</text>
          </paragraph>
        </blockquote>
        <blockquote>
          <paragraph>
            <text>c</text>
          </paragraph>
        </blockquote>
        <blockquote>
          <paragraph>
            <text>
              d<head />
            </text>
          </paragraph>
        </blockquote>
        <paragraph />
      </doc>
    )
    dataTransfer = await user.copy()
  }
  const { state, user } = renderEditor(
    <doc>
      <blockquote>
        <paragraph>
          <text>a</text>
        </paragraph>
      </blockquote>
      <blockquote>
        <paragraph>
          <text>b</text>
        </paragraph>
      </blockquote>
      <blockquote>
        <paragraph>
          <text>c</text>
        </paragraph>
      </blockquote>
      <blockquote>
        <paragraph>
          <text>
            d<cursor />
          </text>
        </paragraph>
      </blockquote>
      <paragraph />
    </doc>
  )
  await user.paste(dataTransfer)
  expect(state()).toMatchInlineSnapshot(`
    <doc>
      <blockquote>
        <paragraph>
          <text>
            a
          </text>
        </paragraph>
      </blockquote>
      <blockquote>
        <paragraph>
          <text>
            b
          </text>
        </paragraph>
      </blockquote>
      <blockquote>
        <paragraph>
          <text>
            c
          </text>
        </paragraph>
      </blockquote>
      <blockquote>
        <paragraph>
          <text>
            da
          </text>
        </paragraph>
      </blockquote>
      <blockquote>
        <paragraph>
          <text>
            b
          </text>
        </paragraph>
      </blockquote>
      <blockquote>
        <paragraph>
          <text>
            c
          </text>
        </paragraph>
      </blockquote>
      <blockquote>
        <paragraph>
          <text>
            d
            <cursor />
          </text>
        </paragraph>
      </blockquote>
      <paragraph />
    </doc>
  `)
})

test('codeblock pasting with language', async () => {
  let dataTransfer
  const codeBlock = (
    <code_block language="javascript">
      <text>console.log(1);</text>
    </code_block>
  )
  {
    const { user } = renderEditor(
      <doc>
        <paragraph>
          <anchor />
        </paragraph>
        {codeBlock}
        <paragraph>
          <head />
        </paragraph>
      </doc>
    )

    dataTransfer = await user.copy()
  }
  const { state, user } = renderEditor(
    <doc>
      <paragraph />
    </doc>
  )
  await user.paste(dataTransfer)
  expect(state()).toEqual(
    <doc>
      <paragraph />
      {codeBlock}
      <paragraph>
        <cursor />
      </paragraph>
    </doc>
  )
})
