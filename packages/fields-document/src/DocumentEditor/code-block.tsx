import React, { useMemo } from 'react'
import { Transforms } from 'slate'

import { Icon } from '@keystar/ui/icon'
import { codeIcon } from '@keystar/ui/icon/icons/codeIcon'
import { useToolbarState } from './toolbar-state'
import { ActionButton } from '@keystar/ui/button'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { Kbd, Text } from '@keystar/ui/typography'
import { ReactEditor } from 'slate-react'

export * from './code-block-shared'

function CodeButton () {
  const {
    editor,
    code: { isDisabled, isSelected },
  } = useToolbarState()

  return useMemo(
    () => (
      <ActionButton
        isSelected={isSelected}
        isDisabled={isDisabled}
        prominence="low"
        onPress={() => {
          if (isSelected) {
            Transforms.unwrapNodes(editor, {
              match: node => node.type === 'code',
            })
          } else {
            Transforms.wrapNodes(editor, {
              type: 'code',
              children: [{ text: '' }],
            })
          }
          ReactEditor.focus(editor)
        }}
      >
        <Icon src={codeIcon} />
      </ActionButton>
    ),
    [isDisabled, isSelected, editor]
  )
}

export const codeButton = (
  <TooltipTrigger>
    <CodeButton />
    <Tooltip>
      <Text>Code block</Text>
      <Kbd>```</Kbd>
    </Tooltip>
  </TooltipTrigger>
)
