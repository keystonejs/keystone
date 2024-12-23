import React, { useMemo, Fragment } from 'react'
import { Tooltip } from '@keystone-ui/tooltip'
import { Transforms } from 'slate'

import { Icon } from '@keystar/ui/icon'
import { codeIcon } from '@keystar/ui/icon/icons/codeIcon'
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
        <Icon src={codeIcon} />
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
