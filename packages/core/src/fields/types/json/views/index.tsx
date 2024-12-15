/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Stack, Text } from '@keystone-ui/core'
import { FieldContainer, FieldDescription, FieldLabel, TextArea } from '@keystone-ui/fields'
import {
  type CardValueComponent,
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
  type JSONValue,
} from '../../../../types'
import { CellContainer, CellLink } from '../../../../admin-ui/components'

export const Field = ({
  field,
  forceValidation,
  value,
  onChange,
  autoFocus,
}: FieldProps<typeof controller>) => {
  return (
    <FieldContainer>
      <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
      <Stack>
        <TextArea
          id={field.path}
          aria-describedby={field.description === null ? undefined : `${field.path}-description`}
          readOnly={onChange === undefined}
          css={{
            fontFamily: 'monospace',
            ...(!onChange && {
              backgroundColor: '#eff3f6',
              border: '1px solid transparent',
              '&:focus-visible': {
                outline: 0,
                backgroundColor: '#eff3f6',
                boxShadow: '0 0 0 2px #e1e5e9',
                border: '1px solid #b1b5b9',
              },
            }),
          }}
          autoFocus={autoFocus}
          onChange={event => onChange?.(event.target.value)}
          value={value}
        />
        {forceValidation && (
          <Text color="red600" size="small">
            {'Invalid JSON'}
          </Text>
        )}
      </Stack>
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

type Config = FieldControllerConfig<{ defaultValue: JSONValue }>

export const controller = (config: Config): FieldController<string, string> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue:
      config.fieldMeta.defaultValue === null
        ? ''
        : JSON.stringify(config.fieldMeta.defaultValue, null, 2),
    validate: value => {
      if (!value) return true
      try {
        JSON.parse(value)
        return true
      } catch (e) {
        return false
      }
    },
    deserialize: data => {
      const value = data[config.path]
      // null is equivalent to Prisma.DbNull, and we show that as an empty input
      if (value === null) return ''
      return JSON.stringify(value, null, 2)
    },
    serialize: value => {
      if (!value) return { [config.path]: null }
      try {
        return { [config.path]: JSON.parse(value) }
      } catch (e) {
        return { [config.path]: undefined }
      }
    },
  }
}
