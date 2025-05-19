import { TextField } from '@keystar/ui/text-field'
import { useReducer } from 'react'
import type { FormFieldInputProps } from '../../api'
import { validateUrl } from './validateUrl'

export function UrlFieldInput(
  props: FormFieldInputProps<string | null> & {
    label: string
    description: string | undefined
    validation: { isRequired?: boolean } | undefined
  }
) {
  const [blurred, onBlur] = useReducer(() => true, false)
  return (
    <TextField
      inputMode="url"
      width="auto"
      maxWidth="scale.6000"
      label={props.label}
      description={props.description}
      autoFocus={props.autoFocus}
      value={props.value === null ? '' : props.value}
      onChange={val => {
        props.onChange((val === '' ? null : val) as any)
      }}
      onBlur={onBlur}
      isRequired={props.validation?.isRequired}
      errorMessage={
        props.forceValidation || blurred
          ? validateUrl(props.validation, props.value, props.label)
          : undefined
      }
    />
  )
}
