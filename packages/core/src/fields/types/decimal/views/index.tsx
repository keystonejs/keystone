import { useState } from 'react'

import { TextField } from '@keystar/ui/text-field'

import {
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
  type SimpleFieldTypeInfo,
  Decimal,
} from '../../../../types'
import { entriesTyped } from '../../../../lib/core/utils'

const TYPE_OPERATOR_MAP = {
  equals: '=',
  not: '≠',
  gt: '>',
  lt: '<',
  gte: '≥',
  lte: '≤',
} as const

type Value =
  | { kind: 'create'; value: string | null }
  | { kind: 'update'; initial: string | null; value: string | null }

type Validation = {
  min: string | null
  max: string | null
}

function validate_(
  value: Value,
  validation: Validation,
  isRequired: boolean,
  label: string
): string | undefined {
  const { value: input, kind } = value
  if (kind === 'update' && value.initial === null && input === null) return
  if (isRequired && input === null) return `${label} is required`
  if (typeof input !== 'string') return
  try {
    const v = new Decimal(input)
    if (!v.isFinite()) return `${label} is not finite`
    if (validation.min && v.lessThan(new Decimal(validation.min)))
      return `${label} must be greater than or equal to ${validation.min}`
    if (validation.max && v.greaterThan(new Decimal(validation.max)))
      return `${label} must be less than or equal to ${validation.max}`
  } catch (e: any) {
    return e?.message ?? 'error'
  }
}

export function controller(
  config: FieldControllerConfig<{
    validation: Validation
    defaultValue: string | null
  }>
): FieldController<Value, string | null, SimpleFieldTypeInfo<'Decimal'>['inputs']['where']> & {
  validation: Validation
} {
  const validate = (value: Value, opts: { isRequired: boolean }) => {
    return validate_(value, config.fieldMeta.validation, opts.isRequired, config.label)
  }

  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    validation: config.fieldMeta.validation,
    defaultValue: { kind: 'create', value: config.fieldMeta.defaultValue },
    deserialize: data => ({ kind: 'update', value: data[config.path], initial: data[config.path] }),
    serialize: value => ({ [config.path]: value.value }),
    filter: {
      Filter(props) {
        const {
          autoFocus,
          context,
          forceValidation,
          typeLabel,
          onChange,
          type,
          value,
          ...otherProps
        } = props
        const [isDirty, setDirty] = useState(false)
        if (type === 'empty' || type === 'not_empty') return null

        const labelProps =
          context === 'add' ? { label: config.label, description: typeLabel } : { label: typeLabel }

        return (
          <TextField
            {...otherProps}
            {...labelProps}
            autoFocus={autoFocus}
            errorMessage={
              (forceValidation || isDirty) &&
              !validate({ kind: 'update', initial: null, value }, { isRequired: true })
                ? 'Required'
                : null
            }
            inputMode="decimal"
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
      parseGraphQL: value => {
        return entriesTyped(value).flatMap(([type, value]) => {
          if (type === 'equals' && value === null) {
            return [{ type: 'empty', value: null }]
          }
          if (!value) return []
          if (type === 'equals') return { type: 'equals', value: value as unknown as string }
          if (type === 'not') {
            if (value.equals === null) return { type: 'not_empty', value: null }
            return { type: 'not', value: value.equals as unknown as string }
          }
          if (type === 'gt' || type === 'gte' || type === 'lt' || type === 'lte') {
            return { type, value: value as unknown as string }
          }
          return []
        })
      },
      Label({ label, type, value }) {
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

    validate: (value, opts) => validate(value, opts) === undefined,
  }
}

export function Field({
  field,
  value,
  onChange,
  autoFocus,
  forceValidation,
  isRequired,
}: FieldProps<typeof controller>) {
  const [isDirty, setDirty] = useState(false)
  const isReadOnly = !onChange

  const validate = (value: Value) => {
    return validate_(value, field.validation, isRequired, field.label)
  }

  return (
    <TextField
      autoFocus={autoFocus}
      description={field.description}
      label={field.label}
      errorMessage={(forceValidation || isDirty) && validate(value)}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      inputMode="numeric"
      width="alias.singleLineWidth"
      onBlur={() => setDirty(true)}
      onChange={x => onChange?.({ ...value, value: x === '' ? null : x })}
      value={value.value ?? ''}
    />
  )
}
