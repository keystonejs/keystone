import { useMemo } from 'react'
import { ReactEditor, type RenderElementProps } from 'slate-react'

import { useToolbarState } from './toolbar-state'
import { insertBlockquote } from './blockquote-shared'
import { quoteIcon } from '@keystar/ui/icon/icons/quoteIcon'
import { Icon } from '@keystar/ui/icon'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { Kbd, Text } from '@keystar/ui/typography'
import { EditorToolbarButton } from '@keystar/ui/editor'

export * from './blockquote-shared'

export const BlockquoteElement = ({ attributes, children }: RenderElementProps) => {
  return <blockquote {...attributes}>{children}</blockquote>
}

const BlockquoteButton = () => {
  const {
    editor,
    blockquote: { isDisabled, isSelected },
  } = useToolbarState()
  return useMemo(
    () => (
      <EditorToolbarButton
        isSelected={isSelected}
        isDisabled={isDisabled}
        onPress={() => {
          insertBlockquote(editor)
          ReactEditor.focus(editor)
        }}
      >
        <Icon src={quoteIcon} />
      </EditorToolbarButton>
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
