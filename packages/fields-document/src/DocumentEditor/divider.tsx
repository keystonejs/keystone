import React, { type ComponentProps, Fragment, useMemo } from 'react'

import { MinusIcon } from '@keystone-ui/icons/icons/MinusIcon'
import { Tooltip } from '@keystone-ui/tooltip'

import { KeyboardInTooltip, ToolbarButton } from './primitives'
import { useToolbarState } from './toolbar-state'
import { insertDivider } from './divider-shared'

const minusIcon = <MinusIcon size="small" />

function DividerButton ({
  attrs,
}: {
  attrs: Parameters<ComponentProps<typeof Tooltip>['children']>[0]
}) {
  const {
    editor,
    dividers: { isDisabled },
  } = useToolbarState()
  return useMemo(
    () => (
      <ToolbarButton
        isDisabled={isDisabled}
        onMouseDown={event => {
          event.preventDefault()
          insertDivider(editor)
        }}
        {...attrs}
      >
        {minusIcon}
      </ToolbarButton>
    ),
    [editor, isDisabled, attrs]
  )
}

export const dividerButton = (
  <Tooltip
    content={
      <Fragment>
        Divider<KeyboardInTooltip>---</KeyboardInTooltip>
      </Fragment>
    }
    weight="subtle"
  >
    {attrs => <DividerButton attrs={attrs} />}
  </Tooltip>
)
