import { Icon } from '@keystar/ui/icon'
import { trashIcon } from '@keystar/ui/icon/icons/trashIcon'
import React, { type ReactNode } from 'react'
import type { RenderElementProps } from 'slate-react'
import type { ComponentBlock, PreviewPropsForToolbar, ObjectField, ComponentSchema } from './api'
import { ActionButton } from '@keystar/ui/button'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { BlockPopoverTrigger, BlockPopover } from '../primitives/BlockPopover'
import { blockElementSpacing } from '../utils-hooks'
import { type Element } from 'slate'

export function ChromelessComponentBlockElement(props: {
  renderedBlock: ReactNode
  componentBlock: ComponentBlock & { chromeless: true }
  previewProps: PreviewPropsForToolbar<ObjectField<Record<string, ComponentSchema>>>
  onRemove: () => void
  attributes: RenderElementProps['attributes']
  element: Element
}) {
  const hasToolbar = props.componentBlock.toolbar !== null
  const ChromelessToolbar = props.componentBlock.toolbar ?? DefaultToolbarWithoutChrome

  return (
    <div {...props.attributes} className={blockElementSpacing}>
      {hasToolbar ? (
        <BlockPopoverTrigger element={props.element}>
          <div>{props.renderedBlock}</div>
          <BlockPopover>
            <ChromelessToolbar onRemove={props.onRemove} props={props.previewProps} />
          </BlockPopover>
        </BlockPopoverTrigger>
      ) : (
        <div>{props.renderedBlock}</div>
      )}
    </div>
  )
}

function DefaultToolbarWithoutChrome({
  onRemove,
}: {
  onRemove(): void
  props: Record<string, any>
}) {
  return (
    <TooltipTrigger>
      <ActionButton onPress={onRemove} margin="regular">
        <Icon src={trashIcon} />
      </ActionButton>
      <Tooltip tone="critical">Remove</Tooltip>
    </TooltipTrigger>
  )
}
