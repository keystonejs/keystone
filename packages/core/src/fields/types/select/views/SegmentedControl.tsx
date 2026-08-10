import { type ActionGroupProps, ActionGroup } from '@keystar/ui/action-group'
import { type FieldProps, Field } from '@keystar/ui/field'
import { TextField } from '@keystar/ui/text-field'

type Key = number | string // React.Key now includes bigint, which isn't supported by @react-aria

type SegmentedControlProps<T extends object> = FieldProps &
  Pick<ActionGroupProps<T>, 'children' | 'items'> & {
    value: Key | null
    onChange: (value: Key) => void
    /** The `textValue` is used to display the selected item label in read-only mode. */
    textValue?: string
  }

export function SegmentedControl<T extends object>(props: SegmentedControlProps<T>) {
  const {
    children,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    description,
    errorMessage,
    value,
    items,
    onChange,
    textValue,
    ...otherProps
  } = props
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
    <Field
      description={description}
      errorMessage={errorMessage}
      isRequired={isRequired}
      label={label}
      labelElementType="span"
      {...otherProps}
    >
      {fieldProps => (
        <ActionGroup
          {...fieldProps}
          density="compact"
          disallowEmptySelection
          isDisabled={isDisabled}
          overflowMode="collapse"
          selectionMode="single"
          items={items}
          onSelectionChange={selection => {
            const next = selection.values().next().value
            if (!next) return
            onChange(next)
          }}
          selectedKeys={selectedKeys}
        >
          {children}
        </ActionGroup>
      )}
    </Field>
  )
}
