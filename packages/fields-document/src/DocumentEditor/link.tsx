/** @jsxRuntime classic */
/** @jsx jsx */

import { ReactEditor, type RenderElementProps, useFocused, useSelected } from 'slate-react'
import { Transforms } from 'slate'
import { forwardRef, memo, useEffect, useMemo, useState } from 'react'
import { useSlateStatic as useStaticEditor } from 'slate-react'

import { jsx, useTheme } from '@keystone-ui/core'
import { useControlledPopover } from '@keystone-ui/popover'
import { Tooltip } from '@keystone-ui/tooltip'
import { LinkIcon } from '@keystone-ui/icons/icons/LinkIcon'
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon'
import { ExternalLinkIcon } from '@keystone-ui/icons/icons/ExternalLinkIcon'

import { InlineDialog, ToolbarButton, ToolbarGroup, ToolbarSeparator } from './primitives'
import { useToolbarState } from './toolbar-state'
import {
  useElementWithSetNodes,
  useEventCallback,
  useForceValidation,
} from './utils-hooks'
import { isValidURL } from './isValidURL'
import { wrapLink } from './link-shared'

export * from './link-shared'

export function LinkElement ({
  attributes,
  children,
  element: __elementForGettingPath,
}: RenderElementProps & { element: { type: 'link' } }) {
  const { typography } = useTheme()
  const editor = useStaticEditor()
  const [currentElement, setNode] = useElementWithSetNodes(editor, __elementForGettingPath)
  const href = currentElement.href

  const selected = useSelected()
  const focused = useFocused()
  const [focusedInInlineDialog, setFocusedInInlineDialog] = useState(false)
  // we want to show the link dialog when the editor is focused and the link element is selected
  // or when the input inside the dialog is focused so you would think that would look like this:
  // (selected && focused) || focusedInInlineDialog
  // this doesn't work though because the blur will happen before the focus is inside the inline dialog
  // so this component would be rendered and focused would be false so the input would be removed so it couldn't be focused
  // to fix this, we delay our reading of the updated `focused` value so that we'll still render the dialog
  // immediately after the editor is blurred but before the input has been focused
  const [delayedFocused, setDelayedFocused] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => {
      setDelayedFocused(focused)
    }, 0)
    return () => {
      clearTimeout(id)
    }
  }, [focused])
  const [localForceValidation, setLocalForceValidation] = useState(false)
  const { dialog, trigger } = useControlledPopover(
    {
      isOpen: (selected && focused) || focusedInInlineDialog,
      onClose: () => {},
    },
    {
      placement: 'bottom-start',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ],
    }
  )
  const unlink = useEventCallback(() => {
    Transforms.unwrapNodes(editor, {
      at: ReactEditor.findPath(editor, __elementForGettingPath),
    })
  })
  const forceValidation = useForceValidation()
  const showInvalidState = isValidURL(href) ? false : forceValidation || localForceValidation
  return (
    <span {...attributes} css={{ position: 'relative', display: 'inline-block' }}>
      <a
        {...trigger.props}
        css={{ color: showInvalidState ? 'red' : undefined }}
        ref={trigger.ref}
        href={href}
      >
        {children}
      </a>
      {((selected && delayedFocused) || focusedInInlineDialog) && (
        <InlineDialog
          {...dialog.props}
          ref={dialog.ref}
          onFocus={() => {
            setFocusedInInlineDialog(true)
          }}
          onBlur={() => {
            setFocusedInInlineDialog(false)
            setLocalForceValidation(true)
          }}
        >
          <div css={{ display: 'flex', flexDirection: 'column' }}>
            <ToolbarGroup>
              <input
                css={{ fontSize: typography.fontSize.small, width: 240 }}
                value={href}
                onChange={event => {
                  setNode({ href: event.target.value })
                }}
              />
              <Tooltip content="Open link in new tab" weight="subtle">
                {attrs => (
                  <ToolbarButton
                    as="a"
                    onMouseDown={event => {
                      event.preventDefault()
                    }}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    variant="action"
                    {...attrs}
                  >
                    {externalLinkIcon}
                  </ToolbarButton>
                )}
              </Tooltip>
              {separator}
              <UnlinkButton onUnlink={unlink} />
            </ToolbarGroup>
            {showInvalidState && <span css={{ color: 'red' }}>Please enter a valid URL</span>}
          </div>
        </InlineDialog>
      )}
    </span>
  )
}

const separator = <ToolbarSeparator />
const externalLinkIcon = <ExternalLinkIcon size="small" />

const UnlinkButton = memo(function UnlinkButton ({ onUnlink }: { onUnlink: () => void }) {
  return (
    <Tooltip content="Unlink" weight="subtle">
      {attrs => (
        <ToolbarButton
          variant="destructive"
          onMouseDown={event => {
            event.preventDefault()
            onUnlink()
          }}
          {...attrs}
        >
          <Trash2Icon size="small" />
        </ToolbarButton>
      )}
    </Tooltip>
  )
})

const linkIcon = <LinkIcon size="small" />

const LinkButton = forwardRef<HTMLButtonElement>(function LinkButton (props, ref) {
  const {
    editor,
    links: { isDisabled, isSelected },
  } = useToolbarState()
  return useMemo(
    () => (
      <ToolbarButton
        ref={ref}
        isDisabled={isDisabled}
        isSelected={isSelected}
        onMouseDown={event => {
          event.preventDefault()
          wrapLink(editor, '')
        }}
        {...props}
      >
        {linkIcon}
      </ToolbarButton>
    ),
    [isSelected, isDisabled, editor, props, ref]
  )
})

export const linkButton = (
  <Tooltip content="Link" weight="subtle">
    {attrs => <LinkButton {...attrs} />}
  </Tooltip>
)
