import React from 'react'
import { useField } from '@react-aria/label'

import {
  type ActionGroupProps,
  ActionGroup
} from '@keystar/ui/action-group'
import {
  type FieldProps,
  FieldPrimitive
} from '@keystar/ui/field'
import { TextField } from '@keystar/ui/text-field'

type Key = number | string // React.Key now includes bigint, which isn't supported by @react-aria

type SegmentedControlProps<T> = FieldProps & Pick<ActionGroupProps<T>, 'children' | 'items'> &  {
  value: Key | null
  onChange: (value: Key) => void
  /** The `textValue` is used to display the selected item label in read-only mode. */
  textValue?: string
}

export function SegmentedControl<T> (props: SegmentedControlProps<T>) {
  const { children, isDisabled, isReadOnly, isRequired, label, description, errorMessage, value, items, onChange, textValue, ...otherProps } = props
  const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField(props)
  const selectedKeys = value ? [value] : []

  // The `ActionGroup` isn’t really designed for use within forms, so we need to
  // handle read-only mode. There's probably a better solution but this will at
  // least be accessible.
  if (isReadOnly) {
    return (
      <TextField
        description={description}
        errorMessage={errorMessage}
        isReadOnly={isReadOnly}
        isRequired={isRequired}
        label={label}
        value={textValue}
      />
    )
  }

  return (
    <FieldPrimitive
      description={description}
      descriptionProps={descriptionProps}
      errorMessage={errorMessage}
      errorMessageProps={errorMessageProps}
      isRequired={isRequired}
      label={label}
      labelElementType="span"
      labelProps={labelProps}
      {...otherProps}
    >
      <ActionGroup
        {...fieldProps}
        density="compact"
        disallowEmptySelection
        isDisabled={isDisabled}
        overflowMode="collapse"
        selectionMode='single'
        items={items}
        onSelectionChange={selection => {
          if (selection === 'all') return // irrelevant for single-select
          const next = selection.values().next().value
          if (!next) return
          onChange(next)
        }}
        selectedKeys={selectedKeys}
      >
        {children}
      </ActionGroup>
    </FieldPrimitive>
  )
}
