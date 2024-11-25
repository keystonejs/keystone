import { CalendarDate, getLocalTimeZone, now, parseDate } from '@internationalized/date'
import { useDateFormatter } from '@react-aria/i18n'
import React, { useMemo, useReducer, useState } from 'react'

import { ToggleButton } from '@keystar/ui/button'
import { DatePicker } from '@keystar/ui/date-time'
import { Icon } from '@keystar/ui/icon'
import { calendarClockIcon } from '@keystar/ui/icon/icons/calendarClockIcon'
import { Grid } from '@keystar/ui/layout'
import { TextField } from '@keystar/ui/text-field'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { Text } from '@keystar/ui/typography'

import {
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '../../../../types'

export type Value =
  | { kind: 'create', value: string | null }
  | { kind: 'update', value: string | null, initial: string | null }

export function Field (props: FieldProps<typeof controller>) {
  const { field, value, forceValidation, onChange } = props
  const parsedValue = value.value ? parseDate(value.value) : null

  const [isDirty, setDirty] = useState(false)
  const [isReadonlyUTC, toggleReadonlyUTC] = useReducer((prev) => !prev, false)
  const dateFormatter = useDateFormatter({ dateStyle: 'long' })
  const placeholderValue = useMemo(() => {
    let today = now(getLocalTimeZone())
    return new CalendarDate(today.year, today.month, today.day)
  }, [])

  // the read-only date field is deceptively interactive, better to render a
  // text field to avoid confusion. when there's no value the field is disabled,
  // placeholder text is shown, and the toggle button is hidden
  if (!onChange) {
    return (
      <Grid columns={!!parsedValue ? 'minmax(0, 1fr) auto' : undefined} gap="regular" alignItems="end">
        <TextField
          label={field.label}
          description={field.description}
          isDisabled={!parsedValue}
          isReadOnly
          value={parsedValue
            ? isReadonlyUTC
              ? parsedValue.toString()
              : dateFormatter.format(parsedValue.toDate(getLocalTimeZone()))
            : 'yyyy-mm-dd'
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
      granularity="day"
      // isReadOnly={undefined} // read-only state handled above
      isRequired={field.fieldMeta.isRequired}
      // NOTE: in addition to providing a cue for users about the expected input
      // format, the `placeholderValue` determines the type of value for the
      // field. the implementation below ensures `CalendarDate` so we can avoid
      // unnecessary guards or transformations.
      placeholderValue={placeholderValue}
      onBlur={() => setDirty(true)}
      onChange={datetime => {
        onChange({ ...value, value: datetime?.toString() ?? null })
      }}
      value={parsedValue}
    />
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

export const Cell: CellComponent<typeof controller> = ({ value }) => {
  const dateFormatter = useDateFormatter({ dateStyle: 'medium' })
  return value
    ? <Text>{dateFormatter.format(new Date(value))}</Text>
    : null
}

export type CalendarDayFieldMeta = {
  defaultValue: string | null
  isRequired: boolean
}

export function controller (
  config: FieldControllerConfig<CalendarDayFieldMeta>
): FieldController<Value, string> & { fieldMeta: CalendarDayFieldMeta } {
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
