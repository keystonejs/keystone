import { useEffect } from 'react'
import { TextField } from '@keystar/ui/text-field'
import { Text } from '@keystar/ui/typography'

import type {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-6/core/types'

export function Field({
  field,
  value,
  itemValue,
  onChange,
  autoFocus,
}: FieldProps<typeof controller>) {
  const discriminant = (itemValue as any)?.[field.dependency.field]?.value ?? Infinity
  const hidden = discriminant > field.dependency.minimumValue

  useEffect(() => {
    if (hidden) onChange?.('')
  }, [onChange, hidden])

  if (hidden) return null

  const disabled = onChange === undefined
  return (
    <TextField
      autoFocus={autoFocus}
      description={field.description}
      label={field.label}
      isDisabled={disabled}
      onChange={x => onChange?.(x === '' ? null : x)}
      value={value ?? ''}
    />
  )
}

export const Cell: CellComponent<typeof controller> = ({ item, field }) => {
  const discriminant = (item as any)?.[field.dependency.field]?.value ?? Infinity
  const hidden = discriminant > field.dependency.minimumValue
  if (hidden)
    return (
      <Text>
        <i>hidden</i>
      </Text>
    )
  return <Text>{(item as any)[field.label]}</Text>
}

export function controller(
  config: FieldControllerConfig<{
    dependency: {
      field: string
      minimumValue: number
    }
  }>
): FieldController<string | null, string> & {
  dependency: {
    field: string
    minimumValue: number
  }
} {
  return {
    fieldKey: config.fieldKey,
    label: config.label,
    description: config.description,
    dependency: config.fieldMeta?.dependency,
    defaultValue: null,
    deserialize: data => {
      const value = data[config.fieldKey]
      return typeof value === 'string' ? value : null
    },
    serialize: value => ({ [config.fieldKey]: value }),
    graphqlSelection: config.fieldKey,
  }
}
