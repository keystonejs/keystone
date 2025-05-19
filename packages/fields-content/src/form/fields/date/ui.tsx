import { TextField } from '@keystar/ui/text-field'
import { useReducer } from 'react'
import { validateDate } from './validateDate'
import type { FormFieldInputProps } from '../../api'

export function DateFieldInput(
  props: FormFieldInputProps<string | null> & {
    label: string
    description?: string
    validation?: { isRequired?: boolean; min?: string; max?: string }
  }
) {
  const [blurred, onBlur] = useReducer(() => true, false)

  return (
    <TextField
      label={props.label}
      description={props.description}
      type="date"
      onChange={val => {
        props.onChange(val === '' ? null : val)
      }}
      autoFocus={props.autoFocus}
      value={props.value === null ? '' : props.value}
      onBlur={onBlur}
      isRequired={props.validation?.isRequired}
      errorMessage={
        blurred || props.forceValidation
          ? validateDate(props.validation, props.value, props.label)
          : undefined
      }
    />
  )
}
