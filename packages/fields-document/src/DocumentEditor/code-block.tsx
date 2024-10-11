/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@keystone-ui/core'
import { Tooltip } from '@keystone-ui/tooltip'
import { useMemo, Fragment } from 'react'
import { Transforms } from 'slate'
import { CodeIcon } from '@keystone-ui/icons/icons/CodeIcon'
import { ToolbarButton, KeyboardInTooltip } from './primitives'
import { useToolbarState } from './toolbar-state'

export * from './code-block-shared'

function CodeButton ({ attrs }: { attrs: object }) {
  const {
    editor,
    code: { isDisabled, isSelected },
  } = useToolbarState()

  return useMemo(
    () => (
      <ToolbarButton
        isSelected={isSelected}
        isDisabled={isDisabled}
        onMouseDown={event => {
          event.preventDefault()
          if (isSelected) {
            Transforms.unwrapNodes(editor, { match: node => node.type === 'code' })
          } else {
            Transforms.wrapNodes(editor, { type: 'code', children: [{ text: '' }] })
          }
        }}
        {...attrs}
      >
        <CodeIcon size="small" />
      </ToolbarButton>
    ),
    [isDisabled, isSelected, attrs, editor]
  )
}

export const codeButton = (
  <Tooltip
    weight="subtle"
    content={
      <Fragment>
        Code block <KeyboardInTooltip>```</KeyboardInTooltip>
      </Fragment>
    }
  >
    {attrs => <CodeButton attrs={attrs} />}
  </Tooltip>
)
