import { useFilter, useListFormatter } from '@react-aria/i18n';
import React, { useState } from 'react'

import { Checkbox, CheckboxGroup } from '@keystar/ui/checkbox'
import { Combobox, Item } from '@keystar/ui/combobox'
import { FieldLabel } from '@keystar/ui/field'
import { VStack } from '@keystar/ui/layout'
import { ListView } from '@keystar/ui/list-view'
import { TagGroup } from '@keystar/ui/tag'
import { Text } from '@keystar/ui/typography'

import {
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '../../../../types'

export function Field (props: FieldProps<typeof controller>) {
  if (props.field.displayMode === 'checkboxes') return <CheckboxesModeField {...props} />
  return <SelectModeField {...props} />
}

function SelectModeField (props: FieldProps<typeof controller>) {
  const { field, onChange, value } = props
  const [filterText, setFilterText] = useState('')
  const { contains } = useFilter({ sensitivity: 'base' })
  const items = field.options.filter(option => !value.some(x => x.value === option.value))
  const filteredItems = filterText
    ? items.filter(item => contains(item.label, filterText))
    : items

  return (
    <VStack gap="regular">
      <Combobox
        label={field.label}
        description={field.description}
        isReadOnly={onChange === undefined}
        items={filteredItems}
        loadingState="idle"
        onInputChange={setFilterText}
        inputValue={filterText}
        // selectedKey={null}
        onSelectionChange={key => {
          if (key == null) return
          onChange?.([...value, field.valuesToOptionsWithStringValues[key]])
        }}
        width="auto"
      >
        {item => (
          <Item key={item.value}>{item.label}</Item>
        )}
      </Combobox>

      <TagGroup
        aria-label={`${field.label} selected items`}
        items={value}
        maxRows={2}
        onRemove={(keys) => {
          const key = keys.values().next().value
          onChange?.(value.filter(x => x.value !== key))
        }}
        renderEmptyState={() => (
          <Text color="neutralSecondary" size="small">
            No items…
          </Text>
        )}
      >
        {item => (
          <Item key={item.value}>{item.label}</Item>
        )}
      </TagGroup>
    </VStack>
  )
}

function CheckboxesModeField (props: FieldProps<typeof controller>) {
  const { field, onChange, value } = props
  return (
    <CheckboxGroup
      label={field.label}
      description={field.description}
      isReadOnly={onChange === undefined}
      value={value.map(x => x.value)}
      onChange={keys => {
        onChange?.(keys.map(key => field.valuesToOptionsWithStringValues[key]))
      }}
    >
      {field.options.map(option => (
        <Checkbox key={option.value} value={option.value}>
          {option.label}
        </Checkbox>
      ))}
    </CheckboxGroup>
  )
}

export const Cell: CellComponent<typeof controller> = ({ value = [], field }) => {
  const listFormatter = useListFormatter({ style: 'short', type: 'conjunction' })
  const labels = (value as string[]).map(x => field.valuesToOptionsWithStringValues[x].label)

  let cellContent = null
  if (value.length > 3) {
    cellContent = listFormatter.format([labels[0], `${value.length - 1} more`])
  } else {
    cellContent = listFormatter.format(labels)
  }

  return <Text>{cellContent}</Text>
}

export type AdminMultiSelectFieldMeta = {
  options: readonly { label: string, value: string | number }[]
  type: 'string' | 'integer' | 'enum'
  displayMode: 'checkboxes' | 'select'
  defaultValue: string[] | number[]
}

type Config = FieldControllerConfig<AdminMultiSelectFieldMeta>
type Option = { label: string, value: string }
type Value = readonly Option[]

export function controller (
  config: Config
): FieldController<Value, Option[]> & {
  displayMode: 'checkboxes' | 'select'
  options: Option[]
  type: 'string' | 'integer' | 'enum'
  valuesToOptionsWithStringValues: Record<string, Option>
} {
  const optionsWithStringValues = config.fieldMeta.options.map(x => ({
    label: x.label,
    value: x.value.toString(),
  }))

  const valuesToOptionsWithStringValues = Object.fromEntries(optionsWithStringValues.map(option => [option.value, option]))
  const parseValue = (value: string) => config.fieldMeta.type === 'integer' ? parseInt(value) : value

  return {
    displayMode: config.fieldMeta.displayMode,
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
              <Item key={item.value}>{item.label}</Item>
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
        [config.path]: { [type === 'not_matches' ? 'notIn' : 'in']: options.map(x => x.value) },
      }),
      Label ({ type, value }) {
        const listFormatter = useListFormatter({
          style: 'short',
          type: 'disjunction',
        })

        if (value.length === 0) return type === 'not_matches' ? `is set` : `is not set`

        const labels = value.map(i => i.label)
        const prefix = type === 'not_matches' ? `is not` : `is`

        if (value.length === 1) return `${prefix} ${labels[0]}`
        if (value.length === 2) return `${prefix} ${listFormatter.format(labels)}`
        return `${prefix} ${listFormatter.format([labels[0], `${value.length - 1} more`])}`
      },
      types: {
        matches: {
          label: 'Matches',
          initialValue: [],
        },
        not_matches: {
          label: 'Does not match',
          initialValue: [],
        },
      },
    },
  }
}
