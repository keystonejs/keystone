import { TextField } from '@keystar/ui/text-field'

import type { FieldController, FieldControllerConfig, FieldProps } from '@keystone-6/core/types'

export function Field({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) {
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

export function controller(
  config: FieldControllerConfig<{}>
): FieldController<string | null, string> {
  return {
    fieldKey: config.fieldKey,
    label: config.label,
    description: config.description ?? '',
    defaultValue: null,
    deserialize: data => {
      const value = data[config.fieldKey]
      return typeof value === 'string' ? value : null
    },
    serialize: value => ({ [config.fieldKey]: value }),
    graphqlSelection: config.fieldKey,
  }
}
