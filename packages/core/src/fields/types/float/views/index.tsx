import React, { useState } from 'react'

import { TextField } from '@keystar/ui/text-field'
import { Text } from '@keystar/ui/typography'

import {
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '../../../../types'

const TYPE_OPERATOR_MAP = {
  equals: '=',
  not: '≠',
  gt: '>',
  lt: '<',
  gte: '≥',
  lte: '≤',
} as const

export const Cell: CellComponent = ({ field, item }) => {
  const value = item[field.path]
  return value != null ? <Text>{value.toString()}</Text> : null
}

type Value =
  | { kind: 'create', value: string | null }
  | { kind: 'update', initial: string | null, value: string | null }

type Validation = {
  isRequired: boolean
  min: string
  max: string
}

function validate_ (
  value: Value,
  validation: Validation,
  label: string,
): string | undefined {
  const {
    value: input,
    kind,
  } = value
  if (kind === 'update' && value.initial === null && input === null) return
  if (validation.isRequired && input === null) return `${label} is required`
  if (typeof input !== 'string') return
  const v = parseFloat(input)
  if (Number.isNaN(v)) return `${label} is not a valid float`
  if (validation.min !== undefined && v < parseFloat(validation.min)) return `${label} must be greater than or equal to ${validation.min}`
  if (validation.max !== undefined && v > parseFloat(validation.max)) return `${label} must be less than or equal to ${validation.max}`
}

export function controller (
  config: FieldControllerConfig<{
    validation: Validation
    defaultValue: string | null
  }>
): FieldController<Value, string | null> & {
  validation: Validation
} {
  const validate = (value: Value) => {
    return validate_(
      value,
      config.fieldMeta.validation,
      config.label,
    )
  }

  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    validation: config.fieldMeta.validation,
    defaultValue: { kind: 'create', value: config.fieldMeta.defaultValue, },
    deserialize: data => ({ kind: 'update', value: data[config.path], initial: data[config.path] }),
    serialize: value => {
      const v = value.value !== null ? parseFloat(value.value) : null
      return { [config.path]: Number.isFinite(v) ? v : null }
    },
    filter: {
      Filter (props) {
        const { autoFocus, context, forceValidation, typeLabel, onChange, type, value, ...otherProps } = props
        const [isDirty, setDirty] = useState(false)
        if (type === 'empty' || type === 'not_empty') return null

        const labelProps = context === 'add'
          ? { label: config.label, description: typeLabel }
          : { label: typeLabel }

        return (
          <TextField
            {...otherProps}
            {...labelProps}
            autoFocus={autoFocus}
            errorMessage={(forceValidation || isDirty) && !validate({ kind: 'update', initial: null, value }) ? 'Required' : null}
            inputMode="numeric"
            width="auto"
            onBlur={() => setDirty(true)}
            onChange={x => onChange?.(x === '' ? null : x)}
            value={value ?? ''}
          />
        )
      },

      graphql: ({ type, value }) => {
        if (type === 'empty') return { [config.path]: { equals: null } }
        if (type === 'not_empty') return { [config.path]: { not: { equals: null } } }
        if (type === 'not') return { [config.path]: { not: { equals: value } } }
        return { [config.path]: { [type]: value } }
      },
      Label ({ label, type, value }) {
        if (type === 'empty' || type === 'not_empty') return label.toLocaleLowerCase()
        const operator = TYPE_OPERATOR_MAP[type as keyof typeof TYPE_OPERATOR_MAP]
        return `${operator} ${value}`
      },
      types: {
        equals: {
          label: 'Is exactly',
          initialValue: null,
        },
        not: {
          label: 'Is not exactly',
          initialValue: null,
        },
        gt: {
          label: 'Is greater than',
          initialValue: null,
        },
        lt: {
          label: 'Is less than',
          initialValue: null,
        },
        gte: {
          label: 'Is greater than or equal to',
          initialValue: null,
        },
        lte: {
          label: 'Is less than or equal to',
          initialValue: null,
        },
        empty: {
          label: 'Is empty',
          initialValue: null,
        },
        not_empty: {
          label: 'Is not empty',
          initialValue: null,
        },
      },
    },

    validate: value => validate(value) === undefined,
  }
}

export function Field ({
  field,
  value,
  onChange,
  autoFocus,
  forceValidation,
}: FieldProps<typeof controller>) {
  const [isDirty, setDirty] = useState(false)
  const isReadOnly = !onChange

  const validate = (value: Value) => {
    return validate_(
      value,
      field.validation,
      field.label,
    )
  }

  return (
    <TextField
      autoFocus={autoFocus}
      description={field.description}
      label={field.label}
      errorMessage={(forceValidation || isDirty) && validate(value)}
      isReadOnly={isReadOnly}
      isRequired={field.validation.isRequired}
      inputMode="numeric"
      width="alias.singleLineWidth"
      onBlur={() => setDirty(true)}
      onChange={x => onChange?.({ ...value, value: x === '' ? null : x })}
      value={value.value ?? ''}
    />
  )
}
