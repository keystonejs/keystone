import React, { useMemo } from 'react'

import { Icon } from '@keystar/ui/icon'
import { minusIcon } from '@keystar/ui/icon/icons/minusIcon'

import { useToolbarState } from './toolbar-state'
import { insertDivider } from './divider-shared'
import { ActionButton } from '@keystar/ui/button'
import { Tooltip, TooltipTrigger } from '@keystar/ui/tooltip'
import { Kbd, Text } from '@keystar/ui/typography'

const DividerButton = () => {
  const {
    editor,
    dividers: { isDisabled },
  } = useToolbarState()
  return useMemo(
    () => (
      <ActionButton
        prominence="low"
        isDisabled={isDisabled}
        onPress={() => {
          insertDivider(editor)
        }}
      >
        <Icon src={minusIcon} />
      </ActionButton>
    ),
    [editor, isDisabled]
  )
}

export const dividerButton = (
  <TooltipTrigger delay={200}>
    <DividerButton />
    <Tooltip>
      <Text>Divider</Text>
      <Kbd>---</Kbd>
    </Tooltip>
  </TooltipTrigger>
)
