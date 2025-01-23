/** @jsxRuntime classic */
/** @jsx jsx */

import { useMemo } from 'react'
import { ReactEditor, type RenderElementProps } from 'slate-react'

import { jsx, useTheme } from '@keystone-ui/core'

import { useToolbarState } from './toolbar-state'
import { insertBlockquote } from './blockquote-shared'
import { ActionButton } from '@keystar/ui/button'
import { quoteIcon } from '@keystar/ui/icon/icons/quoteIcon'
import { Icon } from '@keystar/ui/icon'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { Kbd, Text } from '@keystar/ui/typography'

export * from './blockquote-shared'

export const BlockquoteElement = ({ attributes, children }: RenderElementProps) => {
  const { colors, spacing } = useTheme()
  return (
    <blockquote
      css={{
        borderLeft: '3px solid #CBD5E0',
        color: colors.foregroundDim,
        margin: 0,
        padding: `0 ${spacing.xlarge}px`,
      }}
      {...attributes}
    >
      {children}
    </blockquote>
  )
}

const BlockquoteButton = () => {
  const {
    editor,
    blockquote: { isDisabled, isSelected },
  } = useToolbarState()
  return useMemo(
    () => (
      <ActionButton
        prominence="low"
        isSelected={isSelected}
        isDisabled={isDisabled}
        onPress={() => {
          insertBlockquote(editor)
          ReactEditor.focus(editor)
        }}
      >
        <Icon src={quoteIcon} />
      </ActionButton>
    ),
    [editor, isDisabled, isSelected]
  )
}

export const blockquoteButton = (
  <TooltipTrigger>
    <BlockquoteButton />
    <Tooltip>
      <Text>Quote</Text>
      <Kbd>{'>⎵'}</Kbd>
    </Tooltip>
  </TooltipTrigger>
)
