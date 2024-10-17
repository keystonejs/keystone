/** @jsxRuntime classic */
/** @jsx jsx */
import { useState } from 'react'

import { jsx, Inline, Stack, Text } from '@keystone-ui/core'
import { FieldContainer, FieldLabel, DatePicker, FieldDescription } from '@keystone-ui/fields'
import {
  type CardValueComponent,
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '../../../../types'
import { CellContainer, CellLink } from '../../../../admin-ui/components'

export type Value =
  | { kind: 'create', value: string | null }
  | { kind: 'update', value: string | null, initial: string | null }

export const Field = ({
  field,
  value,
  onChange,
  forceValidation,
}: FieldProps<typeof controller>) => {
  const [touchedInput, setTouchedInput] = useState(false)
  const showValidation = touchedInput || forceValidation

  const validationMessage = showValidation
    ? validate(value, field.fieldMeta, field.label)
    : undefined

  return (
    <FieldContainer>
      <Stack>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
        {onChange ? (
          <Inline gap="small">
            <Stack>
              <DatePicker
                onUpdate={date => {
                  onChange({
                    ...value,
                    value: date,
                  })
                }}
                onClear={() => {
                  onChange({ ...value, value: null })
                }}
                onBlur={() => setTouchedInput(true)}
                value={value.value ?? ''}
              />
              {validationMessage && (
                <Text color="red600" size="small">
                  {validationMessage}
                </Text>
              )}
            </Stack>
          </Inline>
        ) : (
          value.value !== null && <Text>{formatOutput(value.value)}</Text>
        )}
      </Stack>
    </FieldContainer>
  )
}

function validate (
  value: Value,
  fieldMeta: CalendarDayFieldMeta,
  label: string
): string | undefined {
  // if we recieve null initially on the item view and the current value is null,
  // we should always allow saving it because:
  // - the value might be null in the database and we don't want to prevent saving the whole item because of that
  // - we might have null because of an access control error
  if (value.kind === 'update' && value.initial === null && value.value === null) {
    return undefined
  }

  if (fieldMeta.isRequired && value.value === null) {
    return `${label} is required`
  }
  return undefined
}

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  const value = item[field.path]
  return linkTo ? (
    <CellLink {...linkTo}>{formatOutput(value)}</CellLink>
  ) : (
    <CellContainer>{formatOutput(value)}</CellContainer>
  )
}
Cell.supportsLinkTo = true

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {formatOutput(item[field.path])}
    </FieldContainer>
  )
}

function formatOutput (isoDateString: string | null) {
  if (!isoDateString) {
    return null
  }
  const date = new Date(`${isoDateString}T00:00Z`)
  const dateInLocalTimezone = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  )
  return dateInLocalTimezone.toLocaleDateString()
}

export type CalendarDayFieldMeta = {
  defaultValue: string | null
  isRequired: boolean
}

export const controller = (
  config: FieldControllerConfig<CalendarDayFieldMeta>
): FieldController<Value, string> & { fieldMeta: CalendarDayFieldMeta } => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    fieldMeta: config.fieldMeta,
    defaultValue: { kind: 'create', value: null },
    deserialize: data => {
      const value = data[config.path]
      return { kind: 'update', initial: value, value }
    },
    serialize: ({ value }) => {
      return { [config.path]: value }
    },
    validate: value => validate(value, config.fieldMeta, config.label) === undefined,
  }
}
