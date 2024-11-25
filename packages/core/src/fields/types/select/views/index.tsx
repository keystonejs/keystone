import React, { type Key, useMemo, useRef, useState } from 'react'
import { useListFormatter } from '@react-aria/i18n'

import { ListView } from '@keystar/ui/list-view'
import { FieldLabel } from '@keystar/ui/field'
import { VStack } from '@keystar/ui/layout'
import { Item, Picker } from '@keystar/ui/picker'
import { Radio, RadioGroup } from '@keystar/ui/radio'
import { tokenSchema } from '@keystar/ui/style'
import { Text } from '@keystar/ui/typography'

import { NullableFieldWrapper } from '../../../../admin-ui/components'
import { SegmentedControl } from './SegmentedControl'

import type {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '../../../../types'

export const Field = (props: FieldProps<typeof controller>) => {
  const { autoFocus, field, forceValidation, onChange, value } = props

  const pickerRef = useRef<HTMLDivElement>(null)
  const [isDirty, setDirty] = useState(false)
  const [preNullValue, setPreNullValue] = useState(value.value || (value.kind === 'update' ? value.initial : null))
  const longestLabelLength = useMemo(() => {
    return field.options.reduce((acc, item) => {
      return item.label.length > acc ? item.label.length : acc
    }, 0)
  }, [field.options])

  const selectedKey = value.value?.value || preNullValue?.value || null
  const isNullable = !field.isRequired
  const isNull = isNullable && value.value?.value == null
  const isInvalid = !validate(value, field.isRequired)
  const isReadOnly = onChange == null
  const errorMessage = isInvalid && (isDirty || forceValidation)
    ? `${field.label} is required.`
    : undefined

  const onSelectionChange = (key: Key) => {
    if (!onChange) return

    // FIXME: the value should be primitive, not an object. i think this is an
    // artefact from react-select’s API
    let newValue: Value['value'] = field.options.find(opt => opt.value === key) ?? null

    // allow clearing the value if the field is not required
    // if (!field.isRequired && key === selectedKey) {
    //   newValue = null
    // }

    onChange({ ...value, value: newValue })
    setDirty(true)
  }
  // TODO: this would benefit from a similar treatment to the text field's
  // `{ kind: 'null', prev: string }` solution
  const onNullChange = (isChecked: boolean) => {
    if (!onChange) return

    if (isChecked) {
      onChange({ ...value, value: null })
      setPreNullValue(value.value)
    } else {
      onChange({ ...value, value: preNullValue || field.options[0] })
    }
    setDirty(true)
  }

  const fieldElement = (() => {
    switch (field.displayMode) {
      case 'segmented-control':
        return (
          <SegmentedControl
            label={field.label}
            description={field.description}
            errorMessage={errorMessage}
            isDisabled={isNull}
            isReadOnly={isReadOnly}
            isRequired={field.isRequired}
            items={field.options}
            onChange={onSelectionChange}
            value={selectedKey}
            textValue={field.options.find(item => item.value === selectedKey)?.label || ''}
          >
            {item => (
              <Item key={item.value}>{item.label}</Item>
            )}
          </SegmentedControl>
        )
      case 'radio':
        return (
          <RadioGroup
            label={field.label}
            description={field.description}
            errorMessage={errorMessage}
            isDisabled={isNull}
            isReadOnly={isReadOnly}
            isRequired={field.isRequired}
            onChange={onSelectionChange}
            // maintain the previous value when set to null in aid of continuity
            // for the user. it will be cleared when the item is saved
            value={value.value?.value ?? preNullValue?.value}
          >
            {field.options.map(item => (
              <Radio key={item.value} value={item.value}>
                {item.label}
              </Radio>
            ))}
          </RadioGroup>
        )
      default:
        return (
          <Picker
            ref={pickerRef}
            autoFocus={autoFocus}
            label={field.label}
            description={field.description}
            errorMessage={errorMessage}
            isDisabled={isNull}
            isReadOnly={isReadOnly}
            isRequired={field.isRequired}
            items={field.options}
            onSelectionChange={onSelectionChange}
            selectedKey={selectedKey}
            flex={{ mobile: true, desktop: 'initial' }}
            UNSAFE_style={{
              fontSize: tokenSchema.typography.text.regular.size,
              width: `clamp(${tokenSchema.size.alias.singleLineWidth}, calc(${longestLabelLength}ex + ${tokenSchema.size.icon.regular}), 100%)`,
            }}
          >
            {item => (
              <Item key={item.value}>{item.label}</Item>
            )}
          </Picker>
        )
    }
  })()

  return (
    <NullableFieldWrapper
      isAllowed={!field.isRequired}
      autoFocus={isNull && autoFocus}
      label={field.label}
      isReadOnly={isReadOnly}
      isNull={isNull}
      onChange={onNullChange}
    >
      {fieldElement}
    </NullableFieldWrapper>
  )
}

export const Cell: CellComponent<typeof controller> = ({ item, field }) => {
  let value = item[field.path] + ''
  const label = field.options.find(x => x.value === value)?.label
  return <Text>{label}</Text>
}

export type AdminSelectFieldMeta = {
  options: readonly { label: string, value: string | number }[]
  type: 'string' | 'integer' | 'enum'
  displayMode: 'select' | 'segmented-control' | 'radio'
  isRequired: boolean
  defaultValue: string | number | null
}

type Config = FieldControllerConfig<AdminSelectFieldMeta>

type Option = { label: string, value: string }

type Value =
  | { value: Option | null, kind: 'create' }
  | { value: Option | null, initial: Option | null, kind: 'update' }

function validate (value: Value, isRequired: boolean) {
  if (isRequired) {
    // if you got null initially on the update screen, we want to allow saving
    // since the user probably doesn't have read access control
    if (value.kind === 'update' && value.initial === null) {
      return true
    }
    return value.value !== null
  }
  return true
}

const FILTER_TYPES = {
  matches: {
    label: 'Matches',
    initialValue: [],
  },
  not_matches: {
    label: 'Does not match',
    initialValue: [],
  },
}

export const controller = (
  config: Config
): FieldController<Value, Option[]> & {
  options: Option[]
  type: 'string' | 'integer' | 'enum'
  displayMode: 'select' | 'segmented-control' | 'radio'
  isRequired: boolean
} => {
  const optionsWithStringValues = config.fieldMeta.options.map(x => ({
    label: x.label,
    value: x.value.toString(),
  }))

  // Transform from string value to type appropriate value
  const t = (v: string | null) =>
    v === null ? null : config.fieldMeta.type === 'integer' ? parseInt(v) : v

  const stringifiedDefault = config.fieldMeta.defaultValue?.toString()

  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: {
      kind: 'create',
      value: optionsWithStringValues.find(x => x.value === stringifiedDefault) ?? null,
    },
    type: config.fieldMeta.type,
    displayMode: config.fieldMeta.displayMode,
    isRequired: config.fieldMeta.isRequired,
    options: optionsWithStringValues,
    deserialize: data => {
      for (const option of config.fieldMeta.options) {
        if (option.value === data[config.path]) {
          const stringifiedOption = { label: option.label, value: option.value.toString() }
          return {
            kind: 'update',
            initial: stringifiedOption,
            value: stringifiedOption,
          }
        }
      }
      return { kind: 'update', initial: null, value: null }
    },
    serialize: value => ({ [config.path]: t(value.value?.value ?? null) }),
    validate: value => validate(value, config.fieldMeta.isRequired),
    filter: {
      Filter (props) {
        const { autoFocus, context, typeLabel, onChange, value, type, ...otherProps } = props

        const densityLevels = ['spacious', 'regular', 'compact'] as const
        const density = densityLevels[Math.min(Math.floor((optionsWithStringValues.length - 1) / 3), 2)]

        const listView = (
          <ListView
            aria-label={typeLabel}
            density={density}
            items={optionsWithStringValues}
            flex
            minHeight={0}
            maxHeight="100%"
            selectionMode="multiple"
            onSelectionChange={selection => {
              if (selection === 'all') return // irrelevant for this case

              onChange(optionsWithStringValues.filter(opt => selection.has(opt.value)))
            }}
            selectedKeys={value.map(x => x.value)}
            {...otherProps}
          >
            {(item) => (
              <Item key={item.value}>
                {item.label}
              </Item>
            )}
          </ListView>
        )

        if (context === 'edit') {
          return (
            <VStack
              gap="medium"
              flex
              minHeight={0}
              maxHeight="100%"
            >
              {/* intentionally not linked: the `ListView` has an explicit "aria-label" to avoid awkwardness with IDs and forked render */}
              <FieldLabel elementType="span">{typeLabel}</FieldLabel>
              {listView}
            </VStack>
          )
        }

        return listView
      },
      graphql: ({ type, value: options }) => ({
        [config.path]: { [type === 'not_matches' ? 'notIn' : 'in']: options.map(x => t(x.value)) },
      }),
      Label ({ type, value }) {
        const listFormatter = useListFormatter({
          style: 'short',
          type: 'disjunction',
        })

        if (value.length === 0) {
          return type === 'not_matches' ? `is set` : `is not set`
        }

        const labels = value.map(i => i.label)
        const prefix = type === 'not_matches' ? `is not` : `is`

        if (value.length === 1) {
          return `${prefix} ${labels[0]}`
        }
        if (value.length === 2) {
          return `${prefix} ${listFormatter.format(labels)}`
        }

        return `${prefix} ${listFormatter.format([labels[0], `${value.length - 1} more`])}`
      },
      types: FILTER_TYPES,
    },
  }
}
