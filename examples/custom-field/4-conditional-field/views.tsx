import React, { useEffect } from 'react'
import { FieldContainer, FieldDescription, FieldLabel, TextInput } from '@keystone-ui/fields'
import { CellLink, CellContainer } from '@keystone-6/core/admin-ui/components'

import {
  type CardValueComponent,
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '@keystone-6/core/types'

export function Field ({
  field,
  value,
  itemValue,
  onChange,
  autoFocus,
}: FieldProps<typeof controller>) {
  const discriminant = (itemValue as any)?.[field.dependency.field]?.value ?? Infinity
  const hidden = discriminant > field.dependency.minimumValue

  useEffect(() => {
    if (hidden) onChange?.('')
  }, [onChange, hidden])

  if (hidden) return null

  const disabled = onChange === undefined
  return (
    <FieldContainer as="fieldset">
      <FieldLabel>{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
      <div>
        <TextInput
          type="text"
          onChange={event => {
            onChange?.(event.target.value)
          }}
          disabled={disabled}
          value={value || ''}
          autoFocus={autoFocus}
        />
      </div>
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
      {item[field.path]}
    </FieldContainer>
  )
}

export const controller = (
  config: FieldControllerConfig<{
    dependency: {
      field: string
      minimumValue: number
    }
  }>
): FieldController<string | null, string> & {
  dependency: {
    field: string
    minimumValue: number
  }
} => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    dependency: config.fieldMeta?.dependency,
    graphqlSelection: config.path,
    defaultValue: null,
    deserialize: data => {
      const value = data[config.path]
      return typeof value === 'string' ? value : null
    },
    serialize: value => ({ [config.path]: value }),
  }
}
