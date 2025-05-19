import type { BasicFormField } from '../../api'
import { FieldDataError } from '../error'
import { TextFieldInput } from '#field-ui/text'
import { validateText } from './validateText'
import { basicFormFieldWithSimpleReaderParse } from '../utils'

export function text({
  label,
  defaultValue = '',
  validation: { length: { max = Infinity, min = 0 } = {}, pattern, isRequired } = {},
  description,
  multiline = false,
}: {
  label: string
  defaultValue?: string | (() => string)
  description?: string
  validation?: {
    isRequired?: boolean
    length?: {
      min?: number
      max?: number
    }
    pattern?: {
      regex: RegExp
      message?: string
    }
  }
  multiline?: boolean
}): BasicFormField<string> {
  min = Math.max(isRequired ? 1 : 0, min)
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return (
        <TextFieldInput
          label={label}
          description={description}
          min={min}
          max={max}
          multiline={multiline}
          pattern={pattern}
          {...props}
        />
      )
    },
    defaultValue() {
      return typeof defaultValue === 'string' ? defaultValue : defaultValue()
    },
    parse(value) {
      if (value === undefined) {
        return ''
      }
      if (typeof value !== 'string') {
        throw new FieldDataError('Must be a string')
      }
      return value
    },
    serialize(value) {
      return { value: value === '' ? undefined : value }
    },
    validate(value) {
      const message = validateText(value, min, max, label, pattern)
      if (message !== undefined) {
        throw new FieldDataError(message)
      }
      return value
    },
  })
}
