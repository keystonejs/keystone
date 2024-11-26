import React, { useState } from 'react'

import { ContextualHelp } from '@keystar/ui/contextual-help'
import { Content } from '@keystar/ui/slots'
import { NumberField } from '@keystar/ui/number-field'

import { Heading, Text } from '@keystar/ui/typography'

import {
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

type Value =
  | { kind: 'create', value: number | null }
  | { kind: 'update', initial: number | null, value: number | null }

type Validation = {
  isRequired: boolean
  min: number
  max: number
}

function validate_ (
  value: Value,
  validation: Validation,
  label: string,
  hasAutoIncrementDefault: boolean
): string | undefined {
  const {
    value: input,
    kind,
  } = value
  if (kind === 'create' && hasAutoIncrementDefault && input === null) return
  if (kind === 'update' && value.initial === null && input === null) return
  if (validation.isRequired && input === null) return `${label} is required`
  if (typeof input !== 'number') return
  const v = input
  if (!Number.isInteger(v)) return `${label} is not a valid integer`
  if (validation.min !== undefined && v < validation.min) return `${label} must be greater than or equal to ${validation.min}`
  if (validation.max !== undefined && v > validation.max) return `${label} must be less than or equal to ${validation.max}`
}

export function controller (
  config: FieldControllerConfig<{
    validation: Validation
    defaultValue: number | null | 'autoincrement'
  }>
): FieldController<Value, number | null> & {
  validation: Validation
  hasAutoIncrementDefault: boolean
} {
  const validate = (value: Value) => {
    return validate_(
      value,
      config.fieldMeta.validation,
      config.label,
      config.fieldMeta.defaultValue === 'autoincrement'
    )
  }

  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    validation: config.fieldMeta.validation,
    defaultValue: {
      kind: 'create',
      value: config.fieldMeta.defaultValue === 'autoincrement' ? null : config.fieldMeta.defaultValue,
    },
    deserialize: data => ({ kind: 'update', value: data[config.path], initial: data[config.path] }),
    serialize: value => ({ [config.path]: value.value }),
    filter: {
      Filter (props) {
        const { autoFocus, context, forceValidation, typeLabel, onChange, type, value, ...otherProps } = props
        const [isDirty, setDirty] = useState(false)
        if (type === 'empty' || type === 'not_empty') return null

        const labelProps = context === 'add'
          ? { label: config.label, description: typeLabel }
          : { label: typeLabel }

        return (
          <NumberField
            {...otherProps}
            {...labelProps}
            autoFocus={autoFocus}
            errorMessage={(forceValidation || isDirty) && !validate({ kind: 'update', initial: null, value }) ? 'Required' : null}
            step={1}
            width="auto"
            onBlur={() => setDirty(true)}
            onChange={x => onChange?.((!Number.isFinite(x)) ? null : x)}
            value={value ?? NaN}
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

    hasAutoIncrementDefault: config.fieldMeta.defaultValue === 'autoincrement',
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
  const isReadOnly = !onChange || field.hasAutoIncrementDefault

  if (field.hasAutoIncrementDefault && value.kind === 'create') {
    return (
      <NumberField
        autoFocus={autoFocus}
        description={field.description}
        label={field.label}
        isReadOnly
        contextualHelp={(
          <ContextualHelp>
            <Heading>Auto increment</Heading>
            <Content>
              <Text>
                This field is set to auto increment. It will default to the next available number.
              </Text>
            </Content>
          </ContextualHelp>
        )}
      />
    )
  }

  const validate = (value: Value) => {
    return validate_(
      value,
      field.validation,
      field.label,
      field.hasAutoIncrementDefault
    )
  }

  return (
    <NumberField
      autoFocus={autoFocus}
      description={field.description}
      label={field.label}
      errorMessage={(forceValidation || isDirty) && validate(value)}
      isReadOnly={isReadOnly}
      isRequired={field.validation.isRequired}
      width="alias.singleLineWidth"
      onBlur={() => setDirty(true)}
      onChange={x => onChange?.({ ...value, value: (!Number.isFinite(x)) ? null : x })}
      value={value.value ?? NaN}
    />
  )
}
