import React, { useState } from 'react'

import { ContextualHelp } from '@keystar/ui/contextual-help'
import { NumberField } from '@keystar/ui/number-field'
import { Content } from '@keystar/ui/slots'
import { TextField } from '@keystar/ui/text-field'
import { Heading, Numeral, Text } from '@keystar/ui/typography'

import {
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '../../../../types'

export function Field ({
  field,
  value,
  onChange,
  autoFocus,
  forceValidation,
}: FieldProps<typeof controller>) {
  const [isDirty, setIsDirty] = useState(false)
  const validationMessage = validate(value, field.validation, field.label, field.hasAutoIncrementDefault)
  const isReadOnly = onChange == null || field.hasAutoIncrementDefault

  if (field.hasAutoIncrementDefault && value.kind === 'create') {
    return (
      <TextField
        autoFocus={autoFocus}
        defaultValue="--"
        description={field.description}
        isReadOnly
        label={field.label}
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

  return (
    <NumberField
      autoFocus={autoFocus}
      description={field.description}
      label={field.label}
      errorMessage={(isDirty || forceValidation) && validationMessage}
      isReadOnly={isReadOnly}
      isRequired={field.validation.isRequired}
      minValue={field.validation.min}
      maxValue={field.validation.max}
      step={1}
      onBlur={() => setIsDirty(true)}
      onChange={val => {
        onChange?.({ ...value, value: val })
      }}
      value={value.value ?? null}
    />
  )
}

export const Cell: CellComponent = ({ field, item }) => {
  const value = item[field.path]
  return value != null ? <Numeral value={value} /> : null
}

function validate (
  value: Value,
  validation: Validation,
  label: string,
  hasAutoIncrementDefault: boolean
): string | undefined {
  const val = value.value
  if (typeof val === 'string') {
    return `${label} must be a whole number`
  }

  // if we recieve null initially on the item view and the current value is null,
  // we should always allow saving it because:
  // - the value might be null in the database and we don't want to prevent saving the whole item because of that
  // - we might have null because of an access control error
  if (value.kind === 'update' && value.initial === null && val === null) {
    return undefined
  }

  if (value.kind === 'create' && value.value === null && hasAutoIncrementDefault) {
    return undefined
  }

  if (validation.isRequired && val === null) {
    return `${label} is required`
  }
  if (typeof val === 'number') {
    if (val < validation.min) {
      return `${label} must be greater than or equal to ${validation.min}`
    }
    if (val > validation.max) {
      return `${label} must be less than or equal to ${validation.max}`
    }
  }

  return undefined
}

type Validation = {
  isRequired: boolean
  min: number
  max: number
}

type Value =
  | { kind: 'update', initial: number | null, value: number | null }
  | { kind: 'create', value: number | null }

export const controller = (
  config: FieldControllerConfig<{
    validation: Validation
    defaultValue: number | null | 'autoincrement'
  }>
): FieldController<Value, number | null> & {
  validation: Validation
  hasAutoIncrementDefault: boolean
} => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    validation: config.fieldMeta.validation,
    defaultValue: {
      kind: 'create',
      value:
        config.fieldMeta.defaultValue === 'autoincrement' ? null : config.fieldMeta.defaultValue,
    },
    deserialize: data => ({ kind: 'update', value: data[config.path], initial: data[config.path] }),
    serialize: value => ({ [config.path]: value.value }),
    hasAutoIncrementDefault: config.fieldMeta.defaultValue === 'autoincrement',
    validate: value =>
      validate(
        value,
        config.fieldMeta.validation,
        config.label,
        config.fieldMeta.defaultValue === 'autoincrement'
      ) === undefined,
    filter: {
      Filter (props) {
        const { autoFocus, context, forceValidation, typeLabel, onChange, type, value, ...otherProps } = props
        const [isDirty, setDirty] = useState(false)

        if (type === 'empty' || type === 'not_empty') {
          return null;
        }

        const labelProps = context === 'add'
          ? { label: config.label, description: typeLabel }
          : { label: typeLabel }

        return (
          <NumberField
            {...otherProps}
            {...labelProps}
            isRequired
            step={1}
            width="auto"
            autoFocus={autoFocus}
            errorMessage={(forceValidation || isDirty) && !value ? 'Required' : null}
            onBlur={() => setDirty(true)}
            onChange={onChange}
            value={value ?? null}
          />
        )
      },

      graphql: ({ type, value }) => {
        if (type === 'empty') {
          return { [config.path]: { equals: null } }
        }
        if (type === 'not_empty') {
          return { [config.path]: { not: { equals: null } } }
        }
        if (type === 'not') {
          return { [config.path]: { not: { equals: value } } }
        }

        return {
          [config.path]: { [type]: value }
        }
      },
      Label ({ label, type, value }) {
        if (type === 'empty' || type === 'not_empty') {
          return label.toLocaleLowerCase()
        }

        let operator = TYPE_OPERATOR_MAP[type as keyof typeof TYPE_OPERATOR_MAP]
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
  }
}

const TYPE_OPERATOR_MAP = {
  equals: '=',
  not: '≠',
  gt: '>',
  lt: '<',
  gte: '≥',
  lte: '≤',
} as const
