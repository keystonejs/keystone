import React, { useState } from 'react'
import { TextField } from '@keystar/ui/text-field'

import type { FieldController, FieldControllerConfig, FieldProps } from '../../../../types'
import { NullableFieldWrapper } from '../../../../admin-ui/components'
import type { TextFieldMeta } from '..'

export function Field(props: FieldProps<typeof controller>) {
  const { autoFocus, field, forceValidation, onChange, value } = props

  const [shouldShowErrors, setShouldShowErrors] = useState(false)
  const validationMessages = validate(value, field.validation, field.label)

  const isReadOnly = onChange == null
  const isNull = value.inner.kind === 'null'

  return (
    <NullableFieldWrapper
      isAllowed={field.isNullable}
      autoFocus={isNull && autoFocus}
      label={field.label}
      isReadOnly={isReadOnly}
      isNull={isNull}
      onChange={() => {
        if (!onChange) return

        const inner =
          value.inner.kind === 'value'
            ? ({ kind: 'null', prev: value.inner.value } as const)
            : ({ kind: 'value', value: value.inner.prev } as const)

        onChange({ ...value, inner })
      }}
    >
      <TextField
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
        onChange={textValue => {
          if (!onChange) return
          onChange({
            ...value,
            inner: {
              kind: 'value',
              value: textValue,
            },
          })
        }}
        // maintain the previous value when set to null in aid of continuity for
        // the user. it will be cleared when the item is saved
        value={value.inner.kind === 'value' ? value.inner.value : value.inner.prev}
      />
    </NullableFieldWrapper>
  )
}

type Config = FieldControllerConfig<TextFieldMeta>

type Validation = {
  isRequired: boolean
}

function validate(value: TextValue, validation: Validation, fieldLabel: string): string[] {
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
    if (validation.isRequired) return [`${fieldLabel} is required`]
    return []
  }
  return []
}

type InnerTextValue = { kind: 'null'; prev: string } | { kind: 'value'; value: string }
type TextValue =
  | { kind: 'create'; inner: InnerTextValue }
  | { kind: 'update'; inner: InnerTextValue; initial: InnerTextValue }

function deserializeTextValue(value: string | null): InnerTextValue {
  if (value === null) return { kind: 'null', prev: '' }
  return { kind: 'value', value }
}

export function controller(config: Config): FieldController<TextValue, string> & {
  validation: Validation
  isNullable: boolean
} {
  const validation: Validation = {
    isRequired: config.fieldMeta.validation.isRequired,
  }
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: { kind: 'create', inner: deserializeTextValue(config.fieldMeta.defaultValue) },
    isNullable: config.fieldMeta.isNullable,
    deserialize: data => {
      const inner = deserializeTextValue(data[config.path])
      return { kind: 'update', inner, initial: inner }
    },
    serialize: value => ({ [config.path]: value.inner.kind === 'null' ? null : value.inner.value }),
    validation,
    validate: val => validate(val, validation, config.label).length === 0,
    filter: {
      Filter(props) {
        const { autoFocus, context, typeLabel, onChange, type, value, ...otherProps } = props

        const labelProps =
          context === 'add' ? { label: config.label, description: typeLabel } : { label: typeLabel }

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
      Label({ label, value }) {
        const trimmedLabel = label.toLowerCase().replace(' exactly', '')
        return `${trimmedLabel} "${value}"`
      },

      graphql: ({ type, value }) => {
        const isNot = type.startsWith('not_')
        const filter = { equals: value }
        return {
          [config.path]: {
            ...(isNot ? { not: filter } : filter),
          },
        }
      },
      types: {
        is_i: {
          label: 'Is exactly',
          initialValue: '',
        },
        not_i: {
          label: 'Is not exactly',
          initialValue: '',
        },
      },
    },
  }
}
