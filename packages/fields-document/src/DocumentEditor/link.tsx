import { type RenderElementProps, ReactEditor } from 'slate-react'
import { Node, Transforms } from 'slate'
import { useEffect, useMemo, useState } from 'react'
import { useSlateStatic as useStaticEditor } from 'slate-react'

import { Icon } from '@keystar/ui/icon'
import { linkIcon } from '@keystar/ui/icon/icons/linkIcon'
import { externalLinkIcon } from '@keystar/ui/icon/icons/externalLinkIcon'
import { editIcon } from '@keystar/ui/icon/icons/editIcon'

import { useToolbarState } from './toolbar-state'
import { focusWithPreviousSelection, useElementWithSetNodes, useEventCallback } from './utils-hooks'
import { isValidURL } from './isValidURL'
import { wrapLink } from './link-shared'
import { BlockPopover, BlockPopoverTrigger, useActiveBlockPopover } from './primitives/BlockPopover'
import { ActionButton, Button, ButtonGroup } from '@keystar/ui/button'
import { Dialog, DialogContainer, useDialogContainer } from '@keystar/ui/dialog'
import { Flex } from '@keystar/ui/layout'
import { Tooltip, TooltipTrigger } from '@keystar/ui/tooltip'
import { Heading, Text } from '@keystar/ui/typography'
import { TextField } from '#fields-ui'
import { Content } from '@keystar/ui/slots'
import { unlinkIcon } from '@keystar/ui/icon/icons/unlinkIcon'

export * from './link-shared'

export function LinkElement({
  attributes,
  children,
  element: __elementForGettingPath,
}: RenderElementProps & { element: { type: 'link' } }) {
  const editor = useStaticEditor()
  const [currentElement, setNode] = useElementWithSetNodes(editor, __elementForGettingPath)
  const href = currentElement.href

  // const [localForceValidation, setLocalForceValidation] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const activePopoverElement = useActiveBlockPopover()
  const selected = activePopoverElement === __elementForGettingPath

  useEffect(() => {
    if (selected && !href) {
      setDialogOpen(true)
    }
  }, [href, selected])

  const unlink = useEventCallback(() => {
    Transforms.unwrapNodes(editor, {
      at: ReactEditor.findPath(editor, __elementForGettingPath),
    })
  })
  // const forceValidation = useForceValidation()
  // TODO: show the invalid state
  // const showInvalidState = isValidURL(href) ? false : forceValidation || localForceValidation
  return (
    <>
      <BlockPopoverTrigger element={__elementForGettingPath}>
        <a href={href} {...attributes}>
          {children}
        </a>
        <BlockPopover placement="bottom start">
          <Flex gap="small" padding="regular">
            <TooltipTrigger>
              <ActionButton prominence="low" onPress={() => setDialogOpen(true)}>
                <Icon src={editIcon} />
              </ActionButton>
              <Tooltip>Edit</Tooltip>
            </TooltipTrigger>
            <TooltipTrigger>
              <ActionButton
                prominence="low"
                onPress={() => {
                  window.open(href, '_blank', 'noopener,noreferrer')
                }}
              >
                <Icon src={externalLinkIcon} />
              </ActionButton>
              <Tooltip>
                <Text truncate={3}>{href}</Text>
              </Tooltip>
            </TooltipTrigger>
            <TooltipTrigger>
              <ActionButton prominence="low" onPress={unlink}>
                <Icon src={unlinkIcon} />
              </ActionButton>
              {/* TODO: needs localization */}
              <Tooltip>Unlink</Tooltip>
            </TooltipTrigger>
          </Flex>
        </BlockPopover>
      </BlockPopoverTrigger>
      <DialogContainer
        onDismiss={() => {
          setDialogOpen(false)
          focusWithPreviousSelection(editor)
        }}
      >
        {dialogOpen && (
          <LinkDialog
            text={Node.string(currentElement)}
            href={href}
            onSubmit={({ href }) => {
              setNode({ href })
            }}
          />
        )}
      </DialogContainer>
    </>
  )
}

function LinkDialog({
  onSubmit,
  ...props
}: {
  href?: string
  text?: string
  onSubmit: (value: { href: string }) => void
}) {
  let [href, setHref] = useState(props.href || '')
  let [touched, setTouched] = useState(false)

  let { dismiss } = useDialogContainer()
  const showInvalidState = touched && !isValidURL(href)

  return (
    <Dialog size="small">
      <form
        style={{ display: 'contents' }}
        onSubmit={event => {
          if (event.target !== event.currentTarget) return
          event.preventDefault()
          if (!showInvalidState) {
            dismiss()
            onSubmit({ href })
          }
        }}
      >
        <Heading>{props.href ? 'Edit' : 'Add'} link</Heading>
        <Content>
          <Flex gap="large" direction="column">
            <TextField label="Text" value={props.text} isReadOnly />
            <TextField
              autoFocus
              isRequired
              onBlur={() => setTouched(true)}
              label="Link"
              onChange={setHref}
              value={href}
              errorMessage={showInvalidState && 'Please provide a valid URL.'}
            />
          </Flex>
        </Content>
        <ButtonGroup>
          <Button onPress={dismiss}>Cancel</Button>
          <Button prominence="high" type="submit">
            Save
          </Button>
        </ButtonGroup>
      </form>
    </Dialog>
  )
}

let _linkIcon = <Icon src={linkIcon} />

function LinkButton() {
  const {
    editor,
    links: { isDisabled, isSelected },
  } = useToolbarState()
  return useMemo(
    () => (
      <ActionButton
        prominence="low"
        isDisabled={isDisabled}
        isSelected={isSelected}
        onPress={() => {
          wrapLink(editor, '')
          ReactEditor.focus(editor)
        }}
      >
        {_linkIcon}
      </ActionButton>
    ),
    [isSelected, isDisabled, editor]
  )
}

export const linkButton = (
  <TooltipTrigger>
    <LinkButton />
    <Tooltip>
      <Text>Link</Text>
    </Tooltip>
  </TooltipTrigger>
)
