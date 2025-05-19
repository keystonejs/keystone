import { useLocalizedStringFormatter } from '@react-aria/i18n'
import { ActionButton, ButtonGroup, Button } from '@keystar/ui/button'
import { DialogContainer, useDialogContainer, Dialog } from '@keystar/ui/dialog'
import { Icon } from '@keystar/ui/icon'
import { editIcon } from '@keystar/ui/icon/icons/editIcon'
import { externalLinkIcon } from '@keystar/ui/icon/icons/externalLinkIcon'
import { unlinkIcon } from '@keystar/ui/icon/icons/unlinkIcon'
import { Flex } from '@keystar/ui/layout'
import { Content } from '@keystar/ui/slots'
import { TextField } from '@keystar/ui/text-field'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { Heading, Text } from '@keystar/ui/typography'
import { useState } from 'react'
import { isValidURL } from '../../form/fields/url/isValidURL'
import l10nMessages from '../../l10n'

export function LinkToolbar(props: {
  text: string
  href: string
  onHrefChange: (href: string) => void
  onUnlink: () => void
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const stringFormatter = useLocalizedStringFormatter(l10nMessages)
  return (
    <Flex gap="small" padding="regular">
      <TooltipTrigger>
        <ActionButton prominence="low" onPress={() => setDialogOpen(true)}>
          <Icon src={editIcon} />
        </ActionButton>
        <Tooltip>{stringFormatter.format('edit')}</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <ActionButton
          prominence="low"
          onPress={() => {
            window.open(props.href, '_blank', 'noopener,noreferrer')
          }}
        >
          <Icon src={externalLinkIcon} />
        </ActionButton>
        <Tooltip>
          <Text truncate={3}>{props.href}</Text>
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <ActionButton prominence="low" onPress={props.onUnlink}>
          <Icon src={unlinkIcon} />
        </ActionButton>
        {/* TODO: needs localization */}
        <Tooltip>Unlink</Tooltip>
      </TooltipTrigger>
      <DialogContainer
        onDismiss={() => {
          setDialogOpen(false)
        }}
      >
        {dialogOpen && (
          <LinkDialog
            text={props.text}
            href={props.href}
            onSubmit={({ href }) => {
              props.onHrefChange(href)
            }}
          />
        )}
      </DialogContainer>
    </Flex>
  )
}

export function LinkDialog({
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
  let stringFormatter = useLocalizedStringFormatter(l10nMessages)
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
          <Button onPress={dismiss}>{stringFormatter.format('cancel')}</Button>
          <Button prominence="high" type="submit">
            {stringFormatter.format('save')}
          </Button>
        </ButtonGroup>
      </form>
    </Dialog>
  )
}
