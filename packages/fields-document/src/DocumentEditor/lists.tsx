/** @jsxRuntime classic */
/** @jsx jsx */

import { useMemo } from 'react'
import { type Element, type Node } from 'slate'
import { jsx } from '@keystone-ui/core'

import { useToolbarState } from './toolbar-state'
import { toggleList } from './lists-shared'
import { Icon } from '@keystar/ui/icon'
import { Kbd, Text } from '@keystar/ui/typography'
import { listIcon } from '@keystar/ui/icon/icons/listIcon'
import { listOrderedIcon } from '@keystar/ui/icon/icons/listOrderedIcon'
import { ReactEditor } from 'slate-react'
import { EditorToolbarGroup, EditorToolbarItem } from '@keystar/ui/editor'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'

export const isListType = (type: string | undefined) =>
  type === 'ordered-list' || type === 'unordered-list'

export const isListNode = (
  node: Node
): node is Element & { type: 'ordered-list' | 'unordered-list' } => isListType(node.type)

export function ListButtons (props: {
  lists: { ordered: boolean, unordered: boolean }
}) {
  const { editor, lists } = useToolbarState()

  const items = useMemo(() => {
    return [
      !!props.lists.unordered && {
        label: 'Bullet list',
        key: 'unordered_list',
        shortcut: '-⎵',
        icon: listIcon,
      },
      !!props.lists.unordered && {
        label: 'Numbered list',
        key: 'ordered_list',
        shortcut: '1.⎵',
        icon: listOrderedIcon,
      },
    ].filter(removeFalse)
  }, [props.lists])

  return useMemo(() => {
    const disabledKeys: string[] = []
    if (lists.ordered.isDisabled) disabledKeys.push('ordered')
    if (lists.unordered.isDisabled) disabledKeys.push('unordered')
    const activeListType = lists.ordered.isSelected ? 'ordered' : lists.unordered.isSelected ? 'unordered' : null

    return (
      <EditorToolbarGroup
        aria-label="Lists"
        value={activeListType}
        disabledKeys={disabledKeys}
        onChange={key => {
          const format = `${key as 'ordered' | 'unordered'}-list` as const
          toggleList(editor, format)
          ReactEditor.focus(editor)
        }}
        selectionMode='single'
      >
        {items.map(item => (
          <TooltipTrigger key={item.key}>
            <EditorToolbarItem value={item.key} aria-label={item.label}>
              <Icon src={item.icon} />
            </EditorToolbarItem>
            <Tooltip>
              <Text>{item.label}</Text>
              <Kbd>{item.shortcut}</Kbd>
            </Tooltip>
          </TooltipTrigger>
        ))}
      </EditorToolbarGroup>
    )
  }, [
    editor,
    lists.ordered.isDisabled,
    lists.ordered.isSelected,
    lists.unordered.isDisabled,
    lists.unordered.isSelected,
    props.lists.ordered,
    props.lists.unordered,
  ])
}


function removeFalse<T> (val: T): val is Exclude<T, false> {
  return val !== false
}
