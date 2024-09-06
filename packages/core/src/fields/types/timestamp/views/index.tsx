import { getLocalTimeZone, now, parseAbsoluteToLocal } from '@internationalized/date'
import { useDateFormatter } from '@react-aria/i18n'
import React, { useReducer, useState } from 'react'

import { ToggleButton } from '@keystar/ui/button'
import { DatePicker } from '@keystar/ui/date-time'
import { Icon } from '@keystar/ui/icon'
import { calendarClockIcon } from '@keystar/ui/icon/icons/calendarClockIcon'
import { Grid } from '@keystar/ui/layout'
import { TextField } from '@keystar/ui/text-field'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'

import {
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '../../../../types'
import { CellContainer, CellLink } from '../../../../admin-ui/components'
import {
  type Value,
  formatOutput,
} from './utils'

export const Field = (props: FieldProps<typeof controller>) => {
  const { field, value, forceValidation, onChange } = props
  const parsedValue = value.value ? parseAbsoluteToLocal(value.value) : null

  const [isDirty, setDirty] = useState(false)
  const [isReadonlyUTC, toggleReadonlyUTC] = useReducer((prev) => !prev, false)
  const dateFormatter = useDateFormatter({ dateStyle: 'long', timeStyle: 'long' })

  // the read-only date field is deceptively interactive, better to render a
  // text field to avoid confusion. when there's no value the field is disabled,
  // placeholder text is shown, and the toggle button is hidden
  if (!onChange) {
    return (
      <Grid columns="minmax(0, 1fr) auto" gap="regular" alignItems="end">
        <TextField
          label={field.label}
          description={field.description}
          isDisabled={!parsedValue}
          isReadOnly
          value={parsedValue
            ? isReadonlyUTC
              ? parsedValue.toAbsoluteString()
              : dateFormatter.format(parsedValue.toDate())
            : 'yyyy-mm-dd --:--:--'
          }
        />
        {!!parsedValue && (
          <TooltipTrigger>
            <ToggleButton
              aria-label="utc time"
              isSelected={isReadonlyUTC}
              onPress={toggleReadonlyUTC}
            >
              <Icon src={calendarClockIcon} />
            </ToggleButton>
            <Tooltip>Local / UTC</Tooltip>
          </TooltipTrigger>
        )}
      </Grid>
    )
  }
  
  const showValidation = isDirty || forceValidation
  const validationMessage = showValidation
    ? validate(value, field.fieldMeta, field.label)
    : undefined

  return (
    <DatePicker
      label={field.label}
      description={field.description}
      errorMessage={showValidation ? validationMessage : undefined}
      granularity="second"
      // isReadOnly={undefined} // read-only state handled above
      isRequired={field.fieldMeta.isRequired}
      // NOTE: in addition to providing a cue for users about the expected input
      // format, the `placeholderValue` determines the type of value for the
      // field. the implementation below ensures `ZonedDateTime` so we can avoid
      // unnecessary guards or transformations.
      placeholderValue={now(getLocalTimeZone())}
      onBlur={() => setDirty(true)}
      onChange={datetime => {
        onChange({ ...value, value: datetime?.toAbsoluteString() ?? null })
      }}
      value={parsedValue}
    />
  )
}

function validate (
  value: Value,
  fieldMeta: TimestampFieldMeta,
  label: string
): string | undefined {
  const isEmpty = !value.value

  // if we recieve null initially on the item view and the current value is null,
  // we should always allow saving it because:
  // - the value might be null in the database and we don't want to prevent saving the whole item because of that
  // - we might have null because of an access control error
  if (value.kind === 'update' && value.initial === null && isEmpty) {
    return undefined
  }

  if (
    value.kind === 'create' &&
    isEmpty &&
    ((typeof fieldMeta.defaultValue === 'object' && fieldMeta.defaultValue?.kind === 'now') ||
      fieldMeta.updatedAt)
  ) {
    return undefined
  }

  if (fieldMeta.isRequired && isEmpty) {
    return `${label} is required`
  }

  // TODO: update field in "@keystar/ui" to use new validation APIs, for more
  // granular validation messages

  return undefined
}

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  let value = item[field.path]
  return linkTo ? (
    <CellLink {...linkTo}>{formatOutput(value)}</CellLink>
  ) : (
    <CellContainer>{formatOutput(value)}</CellContainer>
  )
}
Cell.supportsLinkTo = true

export type TimestampFieldMeta = {
  defaultValue: string | { kind: 'now' } | null
  updatedAt: boolean
  isRequired: boolean
}

const FILTER_TYPES = {
  is: {
    key: 'equals',
    label: 'Is exactly',
    initialValue: null,
  },
  not: {
    key: 'not',
    label: 'Is not exactly',
    initialValue: null,
  },
  before: {
    key: 'lt',
    label: 'Is before',
    initialValue: null,
  },
  after: {
    key: 'gt',
    label: 'Is after',
    initialValue: null,
  },
} as const

export const controller = (
  config: FieldControllerConfig<TimestampFieldMeta>
): FieldController<Value, string> & { fieldMeta: TimestampFieldMeta } => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    fieldMeta: config.fieldMeta,
    defaultValue: {
      kind: 'create',
      value:
        typeof config.fieldMeta.defaultValue === 'string'
          ? config.fieldMeta.defaultValue
          : null
    },
    deserialize: data => {
      const value = data[config.path]
      return {
        kind: 'update',
        initial: data[config.path],
        value: value ?? null
      }
    },
    serialize: ({ value }) => {
      if (value) {
        return { [config.path]: value }
      }
      return { [config.path]: null }
    },
    validate: value => validate(value, config.fieldMeta, config.label) === undefined,
    filter: {
      Filter (props) {
        const { autoFocus, context, typeLabel, onChange, value, type, ...otherProps } = props

        const [isDirty, setDirty] = useState(false)
        const parsedValue = value ? parseAbsoluteToLocal(value) : null

        return (
          <DatePicker
            label={typeLabel}
            granularity="second"
            placeholderValue={now(getLocalTimeZone())}
            errorMessage={isDirty && !value ? 'Required' : null}
            // isRequired
            hideTimeZone
            onBlur={() => setDirty(true)}
            onChange={datetime => {
              onChange(datetime?.toAbsoluteString() ?? null)
            }}
            value={parsedValue}
            {...otherProps}
          />
        )
      },
      graphql: ({ type, value }) => {
        let key = FILTER_TYPES[type as keyof typeof FILTER_TYPES].key
        if (type === 'not') {
          value = { equals: value }
        }
        return {
          [config.path]: {
            [key]: value
          },
        }
      },
      Label ({ type, value }) {
        const dateFormatter = useDateFormatter({ dateStyle: 'short', timeStyle: 'short' })
        const parsedValue = parseAbsoluteToLocal(value)
        const qualifier = FILTER_TYPES[type as keyof typeof FILTER_TYPES].label.toLocaleLowerCase()

        return `${qualifier} ${ dateFormatter.format(parsedValue.toDate())}`
      },
      types: FILTER_TYPES,
    },
  }
}
