import React, { useState } from 'react'
import { TextArea, TextField } from '@keystar/ui/text-field'
import { Text } from '@keystar/ui/typography'

import type {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '../../../../types'
import { NullableFieldWrapper } from '../../../../admin-ui/components'
import type { TextFieldMeta } from '..'

export function Field (props: FieldProps<typeof controller>) {
  const { autoFocus, field, forceValidation, onChange, value } = props

  const [shouldShowErrors, setShouldShowErrors] = useState(false)
  const validationMessages = validate(value, field.validation, field.label)

  const isReadOnly = onChange == null
  const isNull = value.inner.kind === 'null'
  const isTextArea = field.displayMode === 'textarea'
  const FieldComponent = isTextArea ? TextArea : TextField

  return (
    <NullableFieldWrapper
      isAllowed={field.isNullable}
      autoFocus={isNull && autoFocus}
      label={field.label}
      isReadOnly={isReadOnly}
      isNull={isNull}
      onChange={() => {
        if (!onChange) return

        const inner = value.inner.kind === 'value'
          ? { kind: 'null', prev: value.inner.value } as const
          : { kind: 'value', value: value.inner.prev } as const

        onChange({ ...value, inner })
      }}
    >
      <FieldComponent
        autoFocus={autoFocus}
        description={field.description}
        label={field.label}
        errorMessage={
          !!validationMessages.length && (shouldShowErrors || forceValidation)
            ? validationMessages.join('. ')
            : undefined
        }
        isDisabled={isNull}
        isReadOnly={isReadOnly}
        isRequired={field.validation.isRequired}
        onBlur={() => {
          setShouldShowErrors(true)
        }}
        onChange={(textValue) => {
          if (!onChange) return
          onChange({
            ...value,
            inner: {
              kind: 'value',
              value: textValue
            }
          })
        }}
        // maintain the previous value when set to null in aid of continuity for
        // the user. it will be cleared when the item is saved
        value={value.inner.kind === 'value'
          ? value.inner.value
          : value.inner.prev}
      />
    </NullableFieldWrapper>
  )
}

export const Cell: CellComponent = ({ field, item }) => {
  const value = item[field.path]
  return value != null ? <Text>{value.toString()}</Text> : null
}

type Config = FieldControllerConfig<TextFieldMeta>

type Validation = {
  isRequired: boolean
  match: { regex: RegExp, explanation: string | null } | null
  length: { min: number | null, max: number | null }
}

function validate (value: TextValue, validation: Validation, fieldLabel: string): string[] {
  // if the value is the same as the initial for an update, we don't want to block saving
  // since we're not gonna send it anyway if it's the same
  // and going "fix this thing that is unrelated to the thing you're doing" is bad
  // and also bc it could be null bc of read access control
  if (
    value.kind === 'update' &&
    ((value.initial.kind === 'null' && value.inner.kind === 'null') ||
      (value.initial.kind === 'value' &&
        value.inner.kind === 'value' &&
        value.inner.value === value.initial.value))
  ) {
    return []
  }

  if (value.inner.kind === 'null') {
    if (validation.isRequired) {
      return [`${fieldLabel} is required`]
    }
    return []
  }

  const val = value.inner.value

  const messages: string[] = []
  if (validation.length.min !== null && val.length < validation.length.min) {
    if (validation.length.min === 1) {
      messages.push(`${fieldLabel} must not be empty`)
    } else {
      messages.push(`${fieldLabel} must be at least ${validation.length.min} characters long`)
    }
  }
  if (validation.length.max !== null && val.length > validation.length.max) {
    messages.push(`${fieldLabel} must be no longer than ${validation.length.max} characters`)
  }
  if (validation.match && !validation.match.regex.test(val)) {
    messages.push(
      validation.match.explanation || `${fieldLabel} must match ${validation.match.regex}`
    )
  }
  return messages
}

type InnerTextValue = { kind: 'null', prev: string } | { kind: 'value', value: string }
type TextValue =
  | { kind: 'create', inner: InnerTextValue }
  | { kind: 'update', inner: InnerTextValue, initial: InnerTextValue }

function deserializeTextValue (value: string | null): InnerTextValue {
  if (value === null) return { kind: 'null', prev: '' }
  return { kind: 'value', value }
}

export function controller (
  config: Config
): FieldController<TextValue, string> & {
  displayMode: 'input' | 'textarea'
  validation: Validation
  isNullable: boolean
} {
  const validation: Validation = {
    isRequired: config.fieldMeta.validation.isRequired,
    length: config.fieldMeta.validation.length,
    match: config.fieldMeta.validation.match
      ? {
          regex: new RegExp(
            config.fieldMeta.validation.match.regex.source,
            config.fieldMeta.validation.match.regex.flags
          ),
          explanation: config.fieldMeta.validation.match.explanation,
        }
      : null,
  }
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: { kind: 'create', inner: deserializeTextValue(config.fieldMeta.defaultValue) },
    displayMode: config.fieldMeta.displayMode,
    isNullable: config.fieldMeta.isNullable,
    deserialize: data => {
      const inner = deserializeTextValue(data[config.path])
      return { kind: 'update', inner, initial: inner }
    },
    serialize: value => ({ [config.path]: value.inner.kind === 'null' ? null : value.inner.value }),
    validation,
    validate: val => validate(val, validation, config.label).length === 0,
    filter: {
      Filter (props) {
        const { autoFocus, context, typeLabel, onChange, type, value, ...otherProps } = props

        const labelProps = context === 'add'
          ? { label: config.label, description: typeLabel }
          : { label: typeLabel }

        // NOTE: "type" is a valid attribute for an input element, however the
        // prop represents a filter type in this context e.g. "contains_i", so
        // we're filtering it out of the spread.
        // TODO: more consideration is needed for the filter API, once
        // requirements are better understood.
        return (
          <TextField
            {...otherProps}
            {...labelProps}
            autoFocus={autoFocus}
            onChange={onChange}
            value={value}
          />
        )
      },
      Label ({ label, value }) {
        const trimmedLabel = label.toLowerCase().replace(' exactly', '')
        return `${trimmedLabel} "${value}"`
      },

      graphql: ({ type, value }) => {
        const isNot = type.startsWith('not_')
        const key =
          type === 'is_i' || type === 'not_i'
            ? 'equals'
            : type
                .replace(/_i$/, '')
                .replace('not_', '')
                .replace(/_([a-z])/g, (_, char: string) => char.toUpperCase())
        const filter = { [key]: value }
        return {
          [config.path]: {
            ...(isNot ? { not: filter } : filter),
            mode: config.fieldMeta.shouldUseModeInsensitive ? 'insensitive' : undefined,
          },
        }
      },
      types: {
        contains_i: {
          label: 'Contains',
          initialValue: '',
        },
        not_contains_i: {
          label: 'Does not contain',
          initialValue: '',
        },
        is_i: {
          label: 'Is exactly',
          initialValue: '',
        },
        not_i: {
          label: 'Is not exactly',
          initialValue: '',
        },
        starts_with_i: {
          label: 'Starts with',
          initialValue: '',
        },
        not_starts_with_i: {
          label: 'Does not start with',
          initialValue: '',
        },
        ends_with_i: {
          label: 'Ends with',
          initialValue: '',
        },
        not_ends_with_i: {
          label: 'Does not end with',
          initialValue: '',
        },
      },
    },
  }
}
