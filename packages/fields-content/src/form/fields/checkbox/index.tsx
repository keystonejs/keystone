import { CheckboxFieldInput } from '#field-ui/checkbox'
import type { BasicFormField } from '../../api.tsx'
import { FieldDataError } from '../error.ts'
import { basicFormFieldWithSimpleReaderParse } from '../utils.tsx'

export function checkbox({
  label,
  defaultValue = false,
  description,
}: {
  label: string
  defaultValue?: boolean
  description?: string
}): BasicFormField<boolean> {
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return <CheckboxFieldInput {...props} label={label} description={description} />
    },
    defaultValue() {
      return defaultValue
    },
    parse(value) {
      if (value === undefined) return defaultValue
      if (typeof value !== 'boolean') {
        throw new FieldDataError('Must be a boolean')
      }
      return value
    },
    validate(value) {
      return value
    },
    serialize(value) {
      return { value }
    },
  })
}
