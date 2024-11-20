import React, { InputHTMLAttributes } from 'react'

import { Field as KeystarField } from '@keystar/ui/field'

import {
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '@keystone-6/core/types'

// this is the component shown in the create modal and item page
export function Field({
  autoFocus,
  field,
  onChange,
  value,
}: FieldProps<typeof controller>) {
  const readOnlyAccess = onChange === undefined

  return (
    <KeystarField
      label={field.label}
      isReadOnly={readOnlyAccess}
      description={field.description}
      errorMessage={field.validate?.(value) ?? undefined}
    >
      {(inputProps) => (
        <MyCustomInput
          {...inputProps}
          autoFocus={autoFocus}
          onChange={(e) => onChange?.(parseFloat(e.target.value))}
          value={value ?? ''}
        />
      )}
    </KeystarField>
  )
}

function MyCustomInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ fontSize: 32, padding: 8 }} />
}

export function controller(
  // the type parameter here needs to align with what is returned from `getAdminMeta`
  // in the server-side portion of the field type
  config: FieldControllerConfig<{ maxStars: number }>
): FieldController<number | null, string> & { maxStars: number } {
  return {
    maxStars: config.fieldMeta.maxStars,
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: null,
    deserialize: (data) => {
      const value = data[config.path]
      return typeof value === 'number' ? value : null
    },
    serialize: (value) => ({ [config.path]: value }),
  }
}
