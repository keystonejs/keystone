import type { BasicFormField } from '../api.tsx'
import { basicFormFieldWithSimpleReaderParse } from './utils.tsx'

export function empty(): BasicFormField<null> {
  return basicFormFieldWithSimpleReaderParse({
    Input() {
      return null
    },
    defaultValue() {
      return null
    },
    parse() {
      return null
    },
    serialize() {
      return { value: undefined }
    },
    validate(value) {
      return value
    },
    label: 'Empty',
  })
}
