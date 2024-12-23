import React, {
  type ComponentProps,
  Fragment,
  useMemo
} from 'react'

import { Icon } from '@keystar/ui/icon'
import { minusIcon } from '@keystar/ui/icon/icons/minusIcon'
import { Tooltip } from '@keystone-ui/tooltip'

import { KeyboardInTooltip, ToolbarButton } from './primitives'
import { useToolbarState } from './toolbar-state'
import { insertDivider } from './divider-shared'

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
        <Icon src={minusIcon} />
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
