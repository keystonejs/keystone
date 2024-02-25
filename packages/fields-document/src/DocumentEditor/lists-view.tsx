/** @jsxRuntime classic */
/** @jsx jsx */

import { type ReactNode, forwardRef, useMemo } from 'react'
import { jsx } from '@keystone-ui/core'
import { ToolbarButton } from './primitives'
import { useToolbarState } from './toolbar-state'
import { toggleList } from './lists-model'

export const ListButton = forwardRef<
  HTMLButtonElement,
  {
    type: 'ordered-list' | 'unordered-list'
    children: ReactNode
  }
>(function ListButton(props, ref) {
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
