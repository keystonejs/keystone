import type { BasicFormField } from '../api'
import { basicFormFieldWithSimpleReaderParse } from './utils'

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
