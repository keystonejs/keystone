import React from 'react'
import { Cell as CellContainer } from '@keystar/ui/table'
import { TextField } from '@keystar/ui/text-field'

import {
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '@keystone-6/core/types'

export function Field ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) {
  const disabled = onChange === undefined

  return (
    <TextField
      autoFocus={autoFocus}
      description={field.description}
      label={field.label}
      isDisabled={disabled}
      onChange={x => onChange?.(x === '' ? null : x)}
      value={value ?? ''}
    />
  )
}

export const Cell: CellComponent = ({ item, field }) => {
  const value = item[field.path] + ''
  return <CellContainer>{value}</CellContainer>
}

export function controller (
  config: FieldControllerConfig<{}>
): FieldController<string | null, string> {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: null,
    deserialize: data => {
      const value = data[config.path]
      return typeof value === 'string' ? value : null
    },
    serialize: value => ({ [config.path]: value }),
  }
}
