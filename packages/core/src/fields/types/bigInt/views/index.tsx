/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core'
import { FieldContainer, FieldDescription, FieldLabel, TextInput } from '@keystone-ui/fields'
import { useState } from 'react'
import {
  type CardValueComponent,
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '../../../../types'
import { CellLink, CellContainer } from '../../../../admin-ui/components'
import { useFormattedInput } from '../../integer/views/utils'

type Validation = {
  isRequired: boolean
  min: bigint
  max: bigint
}

type Value =
  | { kind: 'create', value: string | bigint | null }
  | { kind: 'update', value: string | bigint | null, initial: unknown | null }

function BigIntInput ({
  value,
  onChange,
  id,
  autoFocus,
  forceValidation,
  validationMessage,
  placeholder,
}: {
  id: string
  autoFocus?: boolean
  value: bigint | string | null
  onChange: (value: bigint | string | null) => void
  forceValidation?: boolean
  validationMessage?: string
  placeholder?: string
}) {
  const [hasBlurred, setHasBlurred] = useState(false)
  const props = useFormattedInput<bigint | null>(
    {
      format: value => (value === null ? '' : value.toString()),
      parse: raw => {
        raw = raw.trim()
        if (raw === '') {
          return null
        }
        if (/^[+-]?\d+$/.test(raw)) {
          try {
            return BigInt(raw)
          } catch {
            return raw
          }
        }
        return raw
      },
    },
    {
      value,
      onChange,
      onBlur: () => {
        setHasBlurred(true)
      },
    }
  )
  return (
    <span>
      <TextInput
        placeholder={placeholder}
        id={id}
        autoFocus={autoFocus}
        inputMode="numeric"
        {...props}
      />
      {(hasBlurred || forceValidation) && validationMessage && (
        <span css={{ color: 'red' }}>{validationMessage}</span>
      )}
    </span>
  )
}

export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
  forceValidation,
}: FieldProps<typeof controller>) => {
  const message = validate(value, field.validation, field.label, field.hasAutoIncrementDefault)

  return (
    <FieldContainer>
      <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
      {onChange ? (
        <span>
          <BigIntInput
            id={field.path}
            autoFocus={autoFocus}
            onChange={val => {
              onChange({ ...value, value: val })
            }}
            value={value.value}
            forceValidation={forceValidation}
            placeholder={
              field.hasAutoIncrementDefault && value.kind === 'create'
                ? 'Defaults to an incremented number'
                : undefined
            }
            validationMessage={message}
            aria-describedby={field.description === null ? undefined : `${field.path}-description`}
          />
        </span>
      ) : value.value === null ? (
        'null'
      ) : (
        value.value.toString()
      )}
    </FieldContainer>
  )
}

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  const value = item[field.path] + ''
  return linkTo ? <CellLink {...linkTo}>{value}</CellLink> : <CellContainer>{value}</CellContainer>
}
Cell.supportsLinkTo = true

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path] === null ? '' : item[field.path]}
    </FieldContainer>
  )
}

function validate (
  state: Value,
  validation: Validation,
  label: string,
  hasAutoIncrementDefault: boolean
): string | undefined {
  const { kind, value } = state
  if (typeof value === 'string') {
    return `${label} must be a BigInt`
  }

  // if we receive null initially on the item view and the current value is null,
  // we should always allow saving it because:
  // - the value might be null in the database and we don't want to prevent saving the whole item because of that
  // - we might have null because of an access control error
  if (kind === 'update' && state.initial === null && value === null) {
    return undefined
  }

  if (kind === 'create' && value === null && hasAutoIncrementDefault) {
    return undefined
  }

  if (validation.isRequired && value === null) {
    return `${label} is required`
  }
  if (typeof value === 'bigint') {
    if (value < validation.min) {
      return `${label} must be greater than or equal to ${validation.min}`
    }
    if (value > validation.max) {
      return `${label} must be less than or equal to ${validation.max}`
    }
  }

  return undefined
}

export const controller = (
  config: FieldControllerConfig<{
    validation: {
      isRequired: boolean
      min: string
      max: string
    }
    defaultValue: string | null | { kind: 'autoincrement' }
  }>
): FieldController<Value, string> & {
  validation: Validation
  hasAutoIncrementDefault: boolean
} => {
  const hasAutoIncrementDefault =
    typeof config.fieldMeta.defaultValue === 'object' &&
    config.fieldMeta.defaultValue?.kind === 'autoincrement'

  const validation = {
    isRequired: config.fieldMeta.validation.isRequired,
    min: BigInt(config.fieldMeta.validation.min),
    max: BigInt(config.fieldMeta.validation.max),
  }

  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    validation,
    defaultValue: {
      kind: 'create',
      value:
        typeof config.fieldMeta.defaultValue === 'string'
          ? BigInt(config.fieldMeta.defaultValue)
          : null,
    },
    deserialize: data => {
      const raw = data[config.path]
      return {
        kind: 'update',
        value: raw === null ? null : BigInt(raw),
        initial: raw,
      }
    },
    serialize: value => ({ [config.path]: value.value === null ? null : value.value.toString() }),
    hasAutoIncrementDefault,
    validate: value =>
      validate(value, validation, config.label, hasAutoIncrementDefault) === undefined,
    filter: {
      Filter ({ autoFocus, type, onChange, value }) {
        return (
          <TextInput
            onChange={event => {
              if (type === 'in' || type === 'not_in') {
                onChange(event.target.value.replace(/[^\d,\s-]/g, ''))
                return
              }
              onChange(event.target.value.replace(/[^\d\s-]/g, ''))
            }}
            value={value}
            autoFocus={autoFocus}
          />
        )
      },

      graphql: ({ type, value }) => {
        const valueWithoutWhitespace = value.replace(/\s/g, '')
        const parsed =
          type === 'in' || type === 'not_in'
            ? valueWithoutWhitespace.split(',')
            : valueWithoutWhitespace
        if (type === 'not') {
          return { [config.path]: { not: { equals: parsed } } }
        }
        const key = type === 'is' ? 'equals' : type === 'not_in' ? 'notIn' : type
        return { [config.path]: { [key]: parsed } }
      },
      Label ({ label, value, type }) {
        let renderedValue = value
        if (['in', 'not_in'].includes(type)) {
          renderedValue = value
            .split(',')
            .map(value => value.trim())
            .join(', ')
        }
        return `${label.toLowerCase()}: ${renderedValue}`
      },
      types: {
        is: {
          label: 'Is exactly',
          initialValue: '',
        },
        not: {
          label: 'Is not exactly',
          initialValue: '',
        },
        gt: {
          label: 'Is greater than',
          initialValue: '',
        },
        lt: {
          label: 'Is less than',
          initialValue: '',
        },
        gte: {
          label: 'Is greater than or equal to',
          initialValue: '',
        },
        lte: {
          label: 'Is less than or equal to',
          initialValue: '',
        },
        in: {
          label: 'Is one of',
          initialValue: '',
        },
        not_in: {
          label: 'Is not one of',
          initialValue: '',
        },
      },
    },
  }
}
