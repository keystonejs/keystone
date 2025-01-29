import React, { useMemo } from 'react'

import { Icon } from '@keystar/ui/icon'
import { minusIcon } from '@keystar/ui/icon/icons/minusIcon'

import { useToolbarState } from './toolbar-state'
import { insertDivider } from './divider-shared'
import { Tooltip, TooltipTrigger } from '@keystar/ui/tooltip'
import { Kbd, Text } from '@keystar/ui/typography'
import { EditorToolbarButton } from '@keystar/ui/editor'

const DividerButton = () => {
  const {
    editor,
    dividers: { isDisabled },
  } = useToolbarState()
  return useMemo(
    () => (
      <EditorToolbarButton
        isDisabled={isDisabled}
        isSelected={false}
        onPress={() => {
          insertDivider(editor)
        }}
      >
        <Icon src={minusIcon} />
      </EditorToolbarButton>
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
