/** @jsxRuntime classic */
/** @jsx jsx */

import { type ReactNode, forwardRef, useMemo } from 'react'
import { type Element, type Node } from 'slate'
import { jsx } from '@keystone-ui/core'

import { ToolbarButton } from './primitives'
import { useToolbarState } from './toolbar-state'
import { toggleList } from './lists-shared'

export const isListType = (type: string | undefined) =>
  type === 'ordered-list' || type === 'unordered-list'

export const isListNode = (
  node: Node
): node is Element & { type: 'ordered-list' | 'unordered-list' } => isListType(node.type)

export const ListButton = forwardRef<
  HTMLButtonElement,
  {
    type: 'ordered-list' | 'unordered-list'
    children: ReactNode
  }
>(function ListButton (props, ref) {
  const {
    editor,
    lists: {
      [props.type === 'ordered-list' ? 'ordered' : 'unordered']: { isDisabled, isSelected },
    },
  } = useToolbarState()

  return useMemo(() => {
    const { type, ...restProps } = props
    return (
      <ToolbarButton
        ref={ref}
        isDisabled={isDisabled}
        isSelected={isSelected}
        onMouseDown={event => {
          event.preventDefault()
          toggleList(editor, type)
        }}
        {...restProps}
      />
    )
  }, [props, ref, isDisabled, isSelected, editor])
})
