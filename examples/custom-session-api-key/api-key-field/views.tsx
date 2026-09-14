import { useId, useState } from 'react'
import { Cell, controller } from '@keystone-6/core/fields/types/password/views'
import { ActionButton, ToggleButton } from '@keystar/ui/button'
import { FieldLabel, FieldMessage } from '@keystar/ui/field'
import { Icon } from '@keystar/ui/icon'
import { eyeIcon } from '@keystar/ui/icon/icons/eyeIcon'
import { rotateCwIcon } from '@keystar/ui/icon/icons/rotateCwIcon'
import { Flex, VStack } from '@keystar/ui/layout'
import { css, tokenSchema } from '@keystar/ui/style'
import { TextField } from '@keystar/ui/text-field'
import { Tooltip, TooltipTrigger } from '@keystar/ui/tooltip'
import { Text } from '@keystar/ui/typography'
import type { FieldProps } from '@keystone-6/core/types'

export { Cell, controller }

function InlineCode(props: { children: string }) {
  return (
    <code
      className={css({
        backgroundColor: tokenSchema.color.alias.backgroundHovered,
        borderRadius: tokenSchema.size.radius.xsmall,
        color: tokenSchema.color.foreground.neutralEmphasis,
        fontFamily: tokenSchema.typography.fontFamily.code,
        paddingInline: tokenSchema.size.space.xsmall,
      })}
    >
      {props.children}
    </code>
  )
}

function validate(value: FieldProps<typeof controller>['value'], field: ReturnType<typeof controller>) {
  if (value.kind === 'initial') return
  if (value.value.length < field.validation.length.min) {
    return `${field.label} must be at least ${field.validation.length.min} characters long`
  }
  if (field.validation.length.max !== null && value.value.length > field.validation.length.max) {
    return `${field.label} must be no longer than ${field.validation.length.max} characters`
  }
  if (field.validation.match && !field.validation.match.regex.test(value.value)) {
    return field.validation.match.explanation
  }
}

function generateSecret() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function Field(props: FieldProps<typeof controller>) {
  const { autoFocus, field, forceValidation, onChange, value } = props
  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const [touched, setTouched] = useState(false)
  const labelId = useId()
  const itemId = typeof props.itemValue.id === 'string' ? props.itemValue.id : '<user-id>'

  const editingValue = value.kind === 'editing' ? value.value : ''
  const displayValue = secureTextEntry ? editingValue.replace(/./g, '•') : editingValue
  const secretPreview = editingValue ? editingValue.replace(/./g, '*') : '<api-key-secret>'
  const validationMessage = forceValidation || touched ? validate(value, field) : undefined

  const generateApiKeySecret = () => {
    const secret = generateSecret()
    setSecureTextEntry(false)
    onChange?.({ kind: 'editing', isSet: value.isSet, value: secret, confirm: secret })
  }

  return (
    <VStack role="group" aria-labelledby={labelId} gap="medium" minWidth={0}>
      <FieldLabel elementType="span" id={labelId}>
        {field.label}
      </FieldLabel>
      <VStack gap="small">
        <Text size="regular" color="neutralSecondary">
          Send <InlineCode>Keystone-Example-API-Key-ID: {itemId}</InlineCode>
        </Text>
        <Text size="regular" color="neutralSecondary">
          Send <InlineCode>Keystone-Example-API-Key-Secret: {secretPreview}</InlineCode>
        </Text>
      </VStack>
      <Flex gap="regular" alignItems="end">
        <TextField
          autoFocus={autoFocus}
          aria-label={field.label}
          isReadOnly
          onBlur={() => setTouched(true)}
          placeholder="API key secret"
          value={displayValue}
          flex
        />
        {!!editingValue && (
          <TooltipTrigger placement="top end">
            <ToggleButton
              aria-label="Show API key secret"
              isSelected={!secureTextEntry}
              onPress={() => setSecureTextEntry(bool => !bool)}
            >
              <Icon src={eyeIcon} />
            </ToggleButton>
            <Tooltip>Show API key secret</Tooltip>
          </TooltipTrigger>
        )}
        {onChange && (
          <TooltipTrigger placement="top end">
            <ActionButton aria-label="Generate API key secret" onPress={generateApiKeySecret}>
              <Icon src={rotateCwIcon} />
            </ActionButton>
            <Tooltip>Generate API key secret</Tooltip>
          </TooltipTrigger>
        )}
      </Flex>
      {!!editingValue && (
        <Text size="small" color="critical">
          Copy this API key secret now. It cannot be accessed again after saving.
        </Text>
      )}
      {!!validationMessage && <FieldMessage>{validationMessage}</FieldMessage>}
    </VStack>
  )
}
