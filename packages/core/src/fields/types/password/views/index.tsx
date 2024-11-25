// @ts-expect-error
import dumbPasswords from 'dumb-passwords'
import React, { useEffect, useId, useRef, useState } from 'react'
import { useSlotId } from '@react-aria/utils'

import { ActionButton, ToggleButton } from '@keystar/ui/button'
import { Checkbox } from '@keystar/ui/checkbox'
import { FieldLabel, FieldMessage } from '@keystar/ui/field'
import { Icon } from '@keystar/ui/icon'
import { eyeIcon } from '@keystar/ui/icon/icons/eyeIcon';
import { asteriskIcon } from '@keystar/ui/icon/icons/asteriskIcon'
import { Flex, VStack } from '@keystar/ui/layout'
import { TextField } from '@keystar/ui/text-field'
import { Text, VisuallyHidden } from '@keystar/ui/typography'

import {
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '../../../../types'

function validate (value: Value, validation: Validation, fieldLabel: string): string | undefined {
  if (value.kind === 'initial' && (value.isSet === null || value.isSet === true)) {
    return undefined
  }
  if (value.kind === 'initial' && validation?.isRequired) {
    return `${fieldLabel} is required`
  }
  if (value.kind === 'editing' && value.confirm !== value.value) {
    return `The passwords do not match`
  }
  if (value.kind === 'editing') {
    const val = value.value
    if (val.length < validation.length.min) {
      if (validation.length.min === 1) {
        return `${fieldLabel} must not be empty`
      }
      return `${fieldLabel} must be at least ${validation.length.min} characters long`
    }
    if (validation.length.max !== null && val.length > validation.length.max) {
      return `${fieldLabel} must be no longer than ${validation.length.max} characters`
    }
    if (validation.match && !validation.match.regex.test(val)) {
      return validation.match.explanation
    }
    if (validation.rejectCommon && dumbPasswords.check(val)) {
      return `${fieldLabel} is too common and is not allowed`
    }
  }
  return undefined
}

function readonlyCheckboxProps (isSet: null | undefined | boolean) {
  const isIndeterminate = isSet == null
  const isSelected = isSet == null ? undefined : isSet
  return {
    children: isIndeterminate ? 'Access denied' : 'Value is set',
    isIndeterminate,
    isReadOnly: true,
    isSelected,
    prominence: 'low' as const,
  }
}

export function Field (props: FieldProps<typeof controller>) {
  const { autoFocus, field, forceValidation, onChange, value } = props

  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const [touched, setTouched] = useState({ value: false, confirm: false })
  const triggerRef = useRef<HTMLButtonElement>(null)

  const isReadOnly = onChange == null
  const validationMessage = forceValidation || (touched.value && touched.confirm)
    ? validate(value, field.validation, field.label)
    : undefined

  const labelId = useId()
  const descriptionId = useSlotId([!!field.description, !!validationMessage])
  const messageId = useSlotId([!!field.description, !!validationMessage])

  const cancelEditing = () => {
    onChange?.({ kind: 'initial', isSet: value.isSet })
    setTimeout(() => {
      triggerRef.current?.focus()
    }, 0)
  }
  const onEscape = (e: React.KeyboardEvent) => {
    if (e.key !== 'Escape' || value.kind !== 'editing') return
    if (value.value === '' && value.confirm === '') {
      cancelEditing()
    }
  }

  // reset when the user cancels, or when the form is submitted
  useEffect(() => {
    if (value.kind === 'initial') {
      setTouched({ value: false, confirm: false })
      setSecureTextEntry(true)
    }
  }, [value.kind])

  return (
    <VStack
      role="group"
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      gap="medium"
      minWidth={0}
    >
      <FieldLabel elementType="span" id={labelId}>
        {field.label}
      </FieldLabel>
      {!!field.description && (
        <Text id={descriptionId} size="regular" color="neutralSecondary">
          {field.description}
        </Text>
      )}
      {isReadOnly ? (
        <Checkbox {...readonlyCheckboxProps(value.isSet)} />
      ) : value.kind === 'initial' ? (
        <ActionButton
          ref={triggerRef}
          alignSelf="start"
          autoFocus={autoFocus}
          onPress={() => {
            onChange({
              kind: 'editing',
              confirm: '',
              value: '',
              isSet: value.isSet,
            })
          }}
        >
          {value.isSet ? `Change ` : `Set `}
          {field.label.toLocaleLowerCase()}
        </ActionButton>
      ) : (
        <Flex gap="regular" direction={{ mobile: 'column', tablet: 'row' }}>
          <TextField
            autoFocus
            aria-label={`new ${field.label}`}
            aria-describedby={[descriptionId, messageId].filter(Boolean).join(' ')}
            // @ts-expect-error — needs to be fixed in "@keystar/ui"
            isInvalid={!!validationMessage}
            onBlur={() => setTouched({ ...touched, value: true })}
            onChange={text => onChange({ ...value, value: text })}
            onKeyDown={onEscape}
            placeholder="New"
            type={secureTextEntry ? 'password' : 'text'}
            value={value.value}
            flex
          />
          <TextField
            aria-label={`confirm ${field.label}`}
            aria-describedby={messageId} // don't repeat the description announcement for the confirm field
            // @ts-expect-error — needs to be fixed in "@keystar/ui"
            isInvalid={!!validationMessage}
            onBlur={() => setTouched({ ...touched, confirm: true })}
            onChange={text => onChange({ ...value, confirm: text })}
            onKeyDown={onEscape}
            placeholder="Confirm"
            type={secureTextEntry ? 'password' : 'text'}
            value={value.confirm}
            flex
          />

          <Flex gap="regular">
            <ToggleButton
              aria-label="show"
              isSelected={!secureTextEntry}
              onPress={() => setSecureTextEntry(bool => !bool)}
            >
              <Icon src={eyeIcon} />
              <Text isHidden={{ above: 'mobile' }}>Show</Text>
            </ToggleButton>
            <ActionButton onPress={cancelEditing}>
              Cancel
            </ActionButton>
          </Flex>
        </Flex>
      )}
      {!!validationMessage && (
        <FieldMessage id={messageId}>{validationMessage}</FieldMessage>
      )}
    </VStack>
  )
}

export const Cell: CellComponent<typeof controller> = ({ value }) => {
  return value.isSet
    ? (
      <div aria-label="is set" style={{display:'flex'}}>
        <Icon src={asteriskIcon} size="small" />
        <Icon src={asteriskIcon} size="small" />
        <Icon src={asteriskIcon} size="small" />
      </div>
    )
    : <VisuallyHidden>not set</VisuallyHidden>
}

type Validation = {
  isRequired: boolean
  rejectCommon: boolean
  match: {
    regex: RegExp
    explanation: string
  } | null
  length: {
    min: number
    max: number | null
  }
}

export type PasswordFieldMeta = {
  isNullable: boolean
  validation: {
    isRequired: boolean
    rejectCommon: boolean
    match: {
      regex: { source: string, flags: string }
      explanation: string
    } | null
    length: {
      min: number
      max: number | null
    }
  }
}

type Value =
  | {
      kind: 'initial'
      isSet: boolean | null
    }
  | {
      kind: 'editing'
      isSet: boolean | null
      value: string
      confirm: string
    }

type PasswordController = FieldController<Value, boolean> & { validation: Validation }

export const controller = (
  config: FieldControllerConfig<PasswordFieldMeta>
): PasswordController => {
  const validation: Validation = {
    ...config.fieldMeta.validation,
    match:
      config.fieldMeta.validation.match === null
        ? null
        : {
            regex: new RegExp(
              config.fieldMeta.validation.match.regex.source,
              config.fieldMeta.validation.match.regex.flags
            ),
            explanation: config.fieldMeta.validation.match.explanation,
          },
  }
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path} {isSet}`,
    validation,
    defaultValue: {
      kind: 'initial',
      isSet: false,
    },
    validate: state => validate(state, validation, config.label) === undefined,
    deserialize: data => ({ kind: 'initial', isSet: data[config.path]?.isSet ?? null }),
    serialize: value => {
      if (value.kind === 'initial') return {}
      return { [config.path]: value.value }
    },
    filter:
      config.fieldMeta.isNullable === false
        ? undefined
        : {
            Filter (props) {
              const { autoFocus, context, typeLabel, onChange, value, type, ...otherProps } = props
              return (
                <Checkbox autoFocus={autoFocus} onChange={onChange} isSelected={value} {...otherProps}>
                  {typeLabel} set
                </Checkbox>
              )
            },
            graphql ({ type, value }) {
              return {
                [config.path]: {
                  isSet: type === 'not' ? !value : value,
                }
              }
            },
            Label ({ type, value }) {
              if (type === 'is' && value || type === 'not' && !value) return `is set`
              return `is not set`
            },
            types: {
              is: {
                label: 'Is',
                initialValue: true,
              },
              not: {
                label: 'Is not',
                initialValue: true,
              },
            },
          },
  }
}
