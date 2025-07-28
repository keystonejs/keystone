import { useState } from 'react'
import { useFilter, useListFormatter } from '@react-aria/i18n'

import { Checkbox, CheckboxGroup } from '@keystar/ui/checkbox'
import { Combobox, Item } from '@keystar/ui/combobox'
import { VStack } from '@keystar/ui/layout'
import { TagGroup } from '@keystar/ui/tag'
import { Text } from '@keystar/ui/typography'

import type {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '../../../../types'

export function Field(props: FieldProps<typeof controller>) {
  if (props.field.displayMode === 'checkboxes') return <CheckboxesModeField {...props} />
  return <SelectModeField {...props} />
}

function SelectModeField(props: FieldProps<typeof controller>) {
  const { field, onChange, value } = props
  const [filterText, setFilterText] = useState('')
  const { contains } = useFilter({ sensitivity: 'base' })
  const items = field.options.filter(option => !value.some(x => x.value === option.value))
  const filteredItems = filterText ? items.filter(item => contains(item.label, filterText)) : items

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
        {item => <Item key={item.value}>{item.label}</Item>}
      </Combobox>

      <TagGroup
        aria-label={`${field.label} selected items`}
        items={value}
        maxRows={2}
        onRemove={keys => {
          const key = keys.values().next().value
          onChange?.(value.filter(x => x.value !== key))
        }}
        renderEmptyState={() => (
          <Text color="neutralSecondary" size="small">
            No items…
          </Text>
        )}
      >
        {item => <Item key={item.value}>{item.label}</Item>}
      </TagGroup>
    </VStack>
  )
}

function CheckboxesModeField(props: FieldProps<typeof controller>) {
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
  options: readonly { label: string; value: string | number }[]
  type: 'string' | 'integer' | 'enum'
  displayMode: 'checkboxes' | 'select'
  defaultValue: string[] | number[]
}

type Config = FieldControllerConfig<AdminMultiSelectFieldMeta>
type Option = { label: string; value: string }
type Value = readonly Option[]

export function controller(config: Config): FieldController<Value, Option[]> & {
  displayMode: 'checkboxes' | 'select'
  options: Option[]
  type: 'string' | 'integer' | 'enum'
  valuesToOptionsWithStringValues: Record<string, Option>
} {
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
    fieldKey: config.fieldKey,
    label: config.label,
    description: config.description,
    displayMode: config.fieldMeta.displayMode,
    type: config.fieldMeta.type,
    options: optionsWithStringValues,
    valuesToOptionsWithStringValues,
    defaultValue: config.fieldMeta.defaultValue.map(x => valuesToOptionsWithStringValues[x]),
    deserialize: data => {
      // if we get null from the GraphQL API (which will only happen if field read access control failed)
      // we'll just show it as nothing being selected for now.
      const values: readonly string[] | readonly number[] = data[config.fieldKey] ?? []
      const selectedOptions = values.map(x => valuesToOptionsWithStringValues[x])
      return selectedOptions
    },
    serialize: value => ({ [config.fieldKey]: value.map(x => parseValue(x.value)) }),
    graphqlSelection: config.fieldKey,
  }
}
