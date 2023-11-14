/** @jsxRuntime classic */
/** @jsx jsx */
import { Fragment } from 'react'
import { jsx } from '@keystone-ui/core'
import { FieldContainer, FieldDescription, FieldLabel, MultiSelect } from '@keystone-ui/fields'
import {
  type CardValueComponent,
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '../../../../types'
import { CellContainer, CellLink } from '../../../../admin-ui/components'

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  return (
    <FieldContainer>
      <Fragment>
        <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
        <FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
        <MultiSelect
          id={field.path}
          isClearable
          autoFocus={autoFocus}
          options={field.options}
          isDisabled={onChange === undefined}
          onChange={newVal => {
            onChange?.(newVal)
          }}
          value={value}
          aria-describedby={field.description === null ? undefined : `${field.path}-description`}
          portalMenu
        />
      </Fragment>
    </FieldContainer>
  )
}

export const Cell: CellComponent<typeof controller> = ({ item, field, linkTo }) => {
  const value: readonly string[] | readonly number[] = item[field.path] ?? []
  const label = value.map(value => field.valuesToOptionsWithStringValues[value].label).join(', ')
  return linkTo ? <CellLink {...linkTo}>{label}</CellLink> : <CellContainer>{label}</CellContainer>
}
Cell.supportsLinkTo = true

export const CardValue: CardValueComponent<typeof controller> = ({ item, field }) => {
  const value: readonly string[] | readonly number[] = item[field.path] ?? []
  const label = value.map(value => field.valuesToOptionsWithStringValues[value].label).join(', ')

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {label}
    </FieldContainer>
  )
}

export type AdminMultiSelectFieldMeta = {
  options: readonly { label: string, value: string | number }[]
  type: 'string' | 'integer' | 'enum'
  defaultValue: string[] | number[]
}

type Config = FieldControllerConfig<AdminMultiSelectFieldMeta>

type Option = { label: string, value: string }

type Value = readonly Option[]

export const controller = (
  config: Config
): FieldController<Value, Option[]> & {
  options: Option[]
  type: 'string' | 'integer' | 'enum'
  valuesToOptionsWithStringValues: Record<string, Option>
} => {
  const optionsWithStringValues = config.fieldMeta.options.map(x => ({
    label: x.label,
    value: x.value.toString(),
  }))

  const valuesToOptionsWithStringValues = Object.fromEntries(
    optionsWithStringValues.map(option => [option.value, option])
  )

  const parseValue = (value: string) =>
    config.fieldMeta.type === 'integer' ? parseInt(value) : value

  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: config.fieldMeta.defaultValue.map(x => valuesToOptionsWithStringValues[x]),
    type: config.fieldMeta.type,
    options: optionsWithStringValues,
    valuesToOptionsWithStringValues,
    deserialize: data => {
      // if we get null from the GraphQL API (which will only happen if field read access control failed)
      // we'll just show it as nothing being selected for now.
      const values: readonly string[] | readonly number[] = data[config.path] ?? []
      const selectedOptions = values.map(x => valuesToOptionsWithStringValues[x])
      return selectedOptions
    },
    serialize: value => ({ [config.path]: value.map(x => parseValue(x.value)) }),
  }
}
