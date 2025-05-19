import { NumberField } from '@keystar/ui/number-field'
import { useReducer } from 'react'
import { validateInteger } from './validateInteger'
import type { FormFieldInputProps } from '../../api'

export function IntegerFieldInput(
  props: FormFieldInputProps<number | null> & {
    label: string
    description: string | undefined
    validation: { isRequired?: boolean; min?: number; max?: number } | undefined
  }
) {
  const [blurred, onBlur] = useReducer(() => true, false)

  return (
    <NumberField
      label={props.label}
      description={props.description}
      isRequired={props.validation?.isRequired}
      errorMessage={
        props.forceValidation || blurred
          ? validateInteger(props.validation, props.value, props.label)
          : undefined
      }
      onBlur={onBlur}
      autoFocus={props.autoFocus}
      value={props.value === null ? undefined : props.value}
      onChange={val => {
        props.onChange((val === undefined ? null : val) as any)
      }}
    />
  )
}
