import { NumberField } from '@keystar/ui/number-field'
import { useReducer } from 'react'
import { validateNumber } from './validateNumber'
import type { FormFieldInputProps } from '../../api'

export function NumberFieldInput(
  props: FormFieldInputProps<number | null> & {
    label: string
    description: string | undefined
    step: number | undefined
    validation: { isRequired?: boolean; min?: number; max?: number; step?: boolean } | undefined
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
          ? validateNumber(props.validation, props.value, props.step, props.label)
          : undefined
      }
      onBlur={onBlur}
      autoFocus={props.autoFocus}
      step={props.step}
      value={props.value === null ? undefined : props.value}
      onChange={val => {
        props.onChange((val === undefined ? null : val) as any)
      }}
    />
  )
}
