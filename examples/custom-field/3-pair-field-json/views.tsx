import React from 'react'
import { FieldContainer, FieldDescription, FieldLabel, TextInput } from '@keystone-ui/fields'
import { CellLink, CellContainer } from '@keystone-6/core/admin-ui/components'

import {
  type CardValueComponent,
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '@keystone-6/core/types'

export function Field ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) {
  const disabled = onChange === undefined
  const { left = null, right = null } = value ?? {}

  return (
    <>
      <FieldContainer as="fieldset">
        <FieldLabel>{field.label} (Left)</FieldLabel>
        <FieldDescription id={`${field.path}-description-left`}>
          {field.description}
        </FieldDescription>
        <div>
          <TextInput
            type="text"
            onChange={event => {
              onChange?.({ left: event.target.value, right })
            }}
            disabled={disabled}
            value={left || ''}
            autoFocus={autoFocus}
          />
        </div>
      </FieldContainer>
      <FieldContainer as="fieldset">
        <FieldLabel>{field.label} (Right)</FieldLabel>
        <FieldDescription id={`${field.path}-description-right`}>
          {field.description}
        </FieldDescription>
        <div>
          <TextInput
            type="text"
            onChange={event => {
              onChange?.({ left, right: event.target.value })
            }}
            disabled={disabled}
            value={right || ''}
            autoFocus={autoFocus}
          />
        </div>
      </FieldContainer>
    </>
  )
}

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  let value = item[field.path] + ''
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
  config: FieldControllerConfig<{}>
): FieldController<
  {
    left: string | null
    right: string | null
  } | null,
  string
> => {
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
