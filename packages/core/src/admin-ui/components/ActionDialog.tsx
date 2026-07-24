import { useId, useMemo, useState } from 'react'

import { Button, ButtonGroup } from '@keystar/ui/button'
import { AlertDialog, Dialog, useDialogContainer } from '@keystar/ui/dialog'
import { Box, VStack } from '@keystar/ui/layout'
import { Content } from '@keystar/ui/slots'
import { Heading, Text } from '@keystar/ui/typography'

import type { ActionMeta, FieldMeta } from '../../types/index.ts'
import { Fields } from '../utils/Fields.tsx'
import { getActionFieldArgFields } from '../utils/actionData.ts'
import { makeDefaultValueState, useInvalidFields } from '../utils/utils.tsx'

export function ActionDialog({
  action,
  title,
  prompt,
  confirmLabel,
  tone = 'neutral',
  onConfirm,
}: {
  action: ActionMeta
  title: string
  prompt: string
  confirmLabel: string
  tone?: 'critical' | 'neutral'
  onConfirm: (actionArgValue: Record<string, unknown>) => Promise<void>
}) {
  const fields = useMemo(() => getActionFieldArgFields(action), [action])
  const fieldEntries = Object.entries(fields)
  const hasFields = fieldEntries.length > 0

  if (!hasFields) {
    return (
      <AlertDialog
        tone={tone}
        title={title}
        cancelLabel="Cancel"
        primaryActionLabel={confirmLabel}
        onPrimaryAction={() => onConfirm({})}
      >
        <Text>{prompt}</Text>
      </AlertDialog>
    )
  }

  return (
    <ActionFieldDialog
      fields={fields}
      title={title}
      prompt={prompt}
      confirmLabel={confirmLabel}
      onConfirm={onConfirm}
    />
  )
}

function ActionFieldDialog({
  fields,
  title,
  prompt,
  confirmLabel,
  onConfirm,
}: {
  fields: Record<string, FieldMeta>
  title: string
  prompt: string
  confirmLabel: string
  onConfirm: (actionArgValue: Record<string, unknown>) => Promise<void>
}) {
  const dialog = useDialogContainer()
  const formId = useId()
  const [forceValidation, setForceValidation] = useState(false)
  const [value, setValue] = useState(() => makeDefaultValueState(fields))
  const isRequireds = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(fields).map(([key, field]) => [key, field.createView.isRequired])
      ),
    [fields]
  )
  const invalidFields = useInvalidFields(fields, value, isRequireds)

  return (
    <Dialog>
      <Heading>{title}</Heading>
      <Content>
        <form
          id={formId}
          onSubmit={async event => {
            if (event.target !== event.currentTarget) return
            event.preventDefault()

            const newForceValidation = invalidFields.size !== 0
            setForceValidation(newForceValidation)
            if (newForceValidation) return

            await onConfirm(value)
            dialog.dismiss()
          }}
        >
          <VStack gap="xlarge">
            <Text>{prompt}</Text>
            <Box paddingTop="regular">
              <Fields
                view="createView"
                position="form"
                fields={fields}
                forceValidation={forceValidation}
                invalidFields={invalidFields}
                value={value}
                isRequireds={isRequireds}
                onChange={setValue}
              />
            </Box>
          </VStack>
        </form>
      </Content>
      <ButtonGroup>
        <Button onPress={dialog.dismiss}>Cancel</Button>
        <Button form={formId} prominence="high" type="submit">
          {confirmLabel}
        </Button>
      </ButtonGroup>
    </Dialog>
  )
}
