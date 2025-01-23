/** @jsxRuntime classic */
/** @jsx jsx */

import { useMemo } from 'react'
import { type Element, type Node } from 'slate'
import { jsx } from '@keystone-ui/core'

import { useToolbarState } from './toolbar-state'
import { toggleList } from './lists-shared'
import { ActionGroup } from '@keystar/ui/action-group'
import { Icon } from '@keystar/ui/icon'
import { Item } from '@keystar/ui/tag'
import { Kbd, Text } from '@keystar/ui/typography'
import { listIcon } from '@keystar/ui/icon/icons/listIcon'
import { listOrderedIcon } from '@keystar/ui/icon/icons/listOrderedIcon'
import { ReactEditor } from 'slate-react'

export const isListType = (type: string | undefined) =>
  type === 'ordered-list' || type === 'unordered-list'

export const isListNode = (
  node: Node
): node is Element & { type: 'ordered-list' | 'unordered-list' } => isListType(node.type)

export function ListButtons (props: {
  lists: { ordered: boolean, unordered: boolean }
}) {
  const { editor, lists } = useToolbarState()
  return useMemo(() => {
    const disabledKeys: string[] = []
    if (lists.ordered.isDisabled) disabledKeys.push('ordered')
    if (lists.unordered.isDisabled) disabledKeys.push('unordered')
    const selectedKeys: string[] = []
    if (lists.ordered.isSelected) selectedKeys.push('ordered')
    if (lists.unordered.isSelected) selectedKeys.push('unordered')

    return (
      <ActionGroup
        flexShrink={0}
        aria-label="Lists"
        selectionMode="single"
        buttonLabelBehavior="hide"
        density="compact"
        // overflowMode="collapse"
        prominence="low"
        summaryIcon={<Icon src={listIcon} />}
        selectedKeys={selectedKeys}
        disabledKeys={disabledKeys}
        onAction={key => {
          const format = `${key as 'ordered' | 'unordered'}-list` as const
          toggleList(editor, format)
          ReactEditor.focus(editor)
        }}
      >
        {[
          props.lists.unordered && (
            <Item key="unordered" textValue="Bullet List (- )">
              <Icon src={listIcon} />
              <Text>Bullet List</Text>
              <Kbd>-⎵</Kbd>
            </Item>
          ),
          props.lists.ordered && (
            <Item key="ordered" textValue="Numbered List (1.)">
              <Icon src={listOrderedIcon} />
              <Text>Numbered List</Text>
              <Kbd>1.⎵</Kbd>
            </Item>
          ),
        ].filter((x): x is Exclude<typeof x, false> => x !== false)}
      </ActionGroup>
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
