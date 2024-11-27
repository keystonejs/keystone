import React, { useState } from 'react'
import { useFilter } from '@react-aria/i18n'

import { FormField } from './api-shared'
import { NumberField } from '@keystar/ui/number-field'
import { tokenSchema } from '@keystar/ui/style'
import { Item as PickerItem, Picker } from '@keystar/ui/picker'
import { Combobox, Item as ComboboxItem } from '@keystar/ui/combobox'
import { TextField } from '@keystar/ui/text-field'

import { VStack } from '@keystar/ui/layout'
import { TagGroup } from '@keystar/ui/tag'
import { Text } from '@keystar/ui/typography'

export { TextField } from '@keystar/ui/text-field'
export { Text } from '@keystar/ui/typography'
export { Checkbox } from '@keystar/ui/checkbox'

export function makeIntegerFieldInput (opts: { label: string, validate: (value: number) => boolean }): FormField<number, unknown>['Input'] {
  return function IntegerFieldInput({ autoFocus, forceValidation, onChange, value }) {
    const [isDirty, setDirty] = useState(false)
    return (
      <NumberField
        autoFocus={autoFocus}
        label={opts.label}
        errorMessage={(forceValidation || isDirty) && !opts.validate(value) ? 'Invalid integer' : null}
        step={1}
        onBlur={() => setDirty(true)}
        onChange={x => onChange?.((!Number.isInteger(x)) ? NaN : x)}
        value={value ?? NaN}
      />
    )
  }
}

export function makeUrlFieldInput (opts: { label: string, validate: (value: string) => boolean }): FormField<string, unknown>['Input'] {
  return function UrlFieldInput({ autoFocus, forceValidation, onChange, value }) {
    const [isDirty, setDirty] = useState(false)
    return <TextField
      autoFocus={autoFocus}
      label={opts.label}
      errorMessage={(forceValidation || isDirty) && !opts.validate(value) ? 'Invalid URL' : null}
      onBlur={() => setDirty(true)}
      onChange={x => onChange?.(x)}
      value={value}
    />
  }
}

export function makeSelectFieldInput ({
  label,
  options
}: {
  label: string,
  options: readonly { label: string, value: string }[]
}): FormField<string, unknown>['Input'] {
  const longestLabelLength = options.reduce((a, item) => Math.max(a, item.label.length), 0)
  return function PickerFieldInput({ autoFocus, forceValidation, onChange, value }) {
    return (
      <Picker
        autoFocus={autoFocus}
        label={label}
        items={options}
        onSelectionChange={(key) => {
          const newVal = options.find(option => option.value === key)?.value
          if (newVal) {
            onChange?.(newVal)
          }
        }}
        selectedKey={options.find(option => option.value === value)?.value ?? null}
        flex={{ mobile: true, desktop: 'initial' }}
        UNSAFE_style={{
          fontSize: tokenSchema.typography.text.regular.size,
          width: `clamp(${tokenSchema.size.alias.singleLineWidth}, calc(${longestLabelLength}ex + ${tokenSchema.size.icon.regular}), 100%)`,
        }}
      >
        {item => (
          <PickerItem key={item.value}>{item.label}</PickerItem>
        )}
      </Picker>
    )
  }
}

export function makeMultiselectFieldInput ({
  label,
  options
}: {
  label: string,
  options: readonly { label: string, value: string }[]
}): FormField<string[], unknown>['Input'] {
  return function ComboFieldInput({ autoFocus, forceValidation, onChange, value }) {
    const [filterText, setFilterText] = useState('')
    const { contains } = useFilter({ sensitivity: 'base' })
    const items = options.filter(option => !value.some(x => x === option.value))
    const filteredItems = filterText
      ? items.filter(item => contains(item.label, filterText))
      : items

    return (
      <VStack gap="regular">
        <Combobox
          label={label}
          isReadOnly={onChange === undefined}
          items={filteredItems}
          loadingState="idle"
          onInputChange={setFilterText}
          inputValue={filterText}
          // selectedKey={null}
          onSelectionChange={key => {
            if (key == null) return
            onChange?.([...value, ...options.filter(x => x.value === key).map(x => x.value)])
          }}
          width="auto"
        >
          {item => (
            <ComboboxItem key={item.value}>{item.label}</ComboboxItem>
          )}
        </Combobox>

        <TagGroup
          aria-label={`${label} selected items`}
          items={value}
          maxRows={2}
          onRemove={(keys) => {
            const key = keys.values().next().value
            onChange?.(value.filter(x => x !== key))
          }}
          renderEmptyState={() => (
            <Text color="neutralSecondary" size="small">
              No items…
            </Text>
          )}
        >
          {item => (
            <ComboboxItem key={item}>{item}</ComboboxItem>
          )}
        </TagGroup>
      </VStack>
    )
  }
}
