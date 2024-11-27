import React, { useState } from 'react'

import { FormField } from './api-shared'
import { NumberField } from '@keystar/ui/number-field'
import { tokenSchema } from '@keystar/ui/style'
import { Item, Picker } from '@keystar/ui/picker'
import { TextField } from '@keystar/ui/text-field'

export { TextField } from '@keystar/ui/text-field'
export { Text } from '@keystar/ui/typography'
export { Checkbox } from '@keystar/ui/checkbox'

export function makeIntegerFieldInput(opts: { label: string, validate: (value: number) => boolean }): FormField<number, unknown>['Input'] {
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

export function makeUrlFieldInput(opts: { label: string, validate: (value: string) => boolean }): FormField<string, unknown>['Input'] {
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

export function makeSelectFieldInput(opts: { label: string, options: readonly { label: string, value: string }[] }): FormField<string, unknown>['Input'] {
  const longestLabelLength = opts.options.reduce((a, item) => Math.max(a, item.label.length), 0)
  return function PickerFieldInput({ autoFocus, forceValidation, onChange, value }) {
    return (
      <Picker
        autoFocus={autoFocus}
        label={opts.label}
        items={opts.options}
        onSelectionChange={(key) => {
          const newVal = opts.options.find(option => option.value === key)?.value
          if (newVal) {
            onChange?.(newVal)
          }
        }}
        selectedKey={opts.options.find(option => option.value === value)?.value ?? null}
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
}