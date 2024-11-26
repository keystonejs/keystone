import React from 'react'
import { TextField } from '@keystar/ui/text-field'

import {
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '@keystone-6/core/types'

export function Field ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) {
  const disabled = onChange === undefined
  const { left = null, right = null } = value ?? {}

  return (
    <>
      <TextField
        autoFocus={autoFocus}
        description={`${field.description} (Left)`}
        label={`${field.label} (Left)`}
        isDisabled={disabled}
        onChange={x => onChange?.({ left: x === '' ? null : x, right })}
        value={left ?? ''}
      />
      <TextField
        autoFocus={autoFocus}
        description={`${field.description} (Right)`}
        label={`${field.label} (Right)`}
        isDisabled={disabled}
        onChange={x => onChange?.({ right: x === '' ? null : x, left })}
        value={right ?? ''}
      />
    </>
  )
}

export function controller (
  config: FieldControllerConfig<{}>
): FieldController<
  {
    left: string | null
    right: string | null
  } | null,
  string
> {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path} {
        left
        right
      }`,
    defaultValue: null,
    deserialize: data => {
      const value = data[config.path]
      return typeof value === 'object' ? value : null
    },
    serialize: value => ({ [config.path]: value }),
  }
}
