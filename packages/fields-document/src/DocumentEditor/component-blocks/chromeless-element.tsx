/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, useTheme } from '@keystone-ui/core'
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon'
import { useControlledPopover } from '@keystone-ui/popover'
import { Tooltip } from '@keystone-ui/tooltip'
import { type ReactNode } from 'react'
import { type RenderElementProps } from 'slate-react'
import { InlineDialog, ToolbarButton } from '../primitives'
import { type ComponentBlock, type PreviewPropsForToolbar, type ObjectField, type ComponentSchema } from './api'

export function ChromelessComponentBlockElement (props: {
  renderedBlock: ReactNode
  componentBlock: ComponentBlock & { chromeless: true }
  previewProps: PreviewPropsForToolbar<ObjectField<Record<string, ComponentSchema>>>
  isOpen: boolean
  onRemove: () => void
  attributes: RenderElementProps['attributes']
}) {
  const { trigger, dialog } = useControlledPopover(
    { isOpen: props.isOpen, onClose: () => {} },
    { modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }
  )
  const { spacing } = useTheme()
  const ChromelessToolbar = props.componentBlock.toolbar ?? DefaultToolbarWithoutChrome
  return (
    <div
      {...props.attributes}
      css={{
        marginBottom: spacing.xlarge,
        marginTop: spacing.xlarge,
      }}
    >
      <div {...trigger.props} ref={trigger.ref}>
        {props.renderedBlock}
        {props.isOpen && (
          <InlineDialog {...dialog.props} ref={dialog.ref}>
            <ChromelessToolbar onRemove={props.onRemove} props={props.previewProps} />
          </InlineDialog>
        )}
      </div>
    </div>
  )
}

function DefaultToolbarWithoutChrome ({
  onRemove,
}: {
  onRemove(): void
  props: Record<string, any>
}) {
  return (
    <Tooltip content="Remove" weight="subtle">
      {attrs => (
        <ToolbarButton
          variant="destructive"
          onMouseDown={event => {
            event.preventDefault()
            onRemove()
          }}
          {...attrs}
        >
          <Trash2Icon size="small" />
        </ToolbarButton>
      )}
    </Tooltip>
  )
}
