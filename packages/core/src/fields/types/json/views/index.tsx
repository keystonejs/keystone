import React from 'react'

import { css, tokenSchema } from '@keystar/ui/style'
import { TextArea } from '@keystar/ui/text-field'
import { Text } from '@keystar/ui/typography'

import {
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
  type JSONValue,
} from '../../../../types'

export const Field = (props: FieldProps<typeof controller>) => {
  const { autoFocus, field, forceValidation, onChange, value } = props
  const errorMessage = forceValidation ? 'Invalid JSON' : undefined

  return (
    <TextArea
      autoFocus={autoFocus}
      description={field.description}
      errorMessage={errorMessage}
      isReadOnly={onChange === undefined}
      label={field.label}
      onChange={onChange}
      value={value}
      UNSAFE_className={css({
        textarea: {
          fontSize: tokenSchema.typography.text.small.size,
          fontFamily: tokenSchema.typography.fontFamily.code,
        }
      })}
    />
  )
}

export const Cell: CellComponent<typeof controller> = ({ value }) => {
  return value
    ? <Text>{JSON.stringify(value)}</Text>
    : null
}

type Config = FieldControllerConfig<{ defaultValue: JSONValue }>

export function controller (config: Config): FieldController<string, string> {
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
