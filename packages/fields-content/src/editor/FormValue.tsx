import { Flex } from '@keystar/ui/layout'
import { Button, ButtonGroup } from '@keystar/ui/button'
import { useDialogContainer } from '@keystar/ui/dialog'
import { useId, useMemo, useState } from 'react'
import { Content } from '@keystar/ui/slots'
import { useLocalizedStringFormatter } from '@react-aria/i18n'
import type { ComponentSchema } from '../form/api'
import { clientSideValidateProp } from '../form/errors'
import { FormValueContentFromPreviewProps } from '../form/form-from-preview'
import { createGetPreviewProps } from '../form/preview-props'
import l10nMessages from '../l10n'

export function FormValue(props: {
  value: Record<string, unknown>
  schema: ComponentSchema
  onSave(value: Record<string, unknown>): void
}) {
  const stringFormatter = useLocalizedStringFormatter(l10nMessages)
  const formId = useId()
  const [forceValidation, setForceValidation] = useState(false)
  const [state, setState] = useState(props.value)
  const previewProps = useMemo(
    () => createGetPreviewProps(props.schema, setState, () => undefined),
    [props.schema]
  )(state)
  const { dismiss } = useDialogContainer()

  return (
    <>
      <Content>
        <Flex
          id={formId}
          elementType="form"
          onSubmit={event => {
            if (event.target !== event.currentTarget) return
            event.preventDefault()
            if (!clientSideValidateProp(props.schema, state)) {
              setForceValidation(true)
            } else {
              props.onSave(state)
              dismiss()
            }
          }}
          direction="column"
          gap="xxlarge"
        >
          <FormValueContentFromPreviewProps {...previewProps} forceValidation={forceValidation} />
        </Flex>
      </Content>
      <ButtonGroup>
        <Button onPress={dismiss}>{stringFormatter.format('cancel')}</Button>
        <Button form={formId} prominence="high" type="submit">
          Done
        </Button>
      </ButtonGroup>
    </>
  )
}
