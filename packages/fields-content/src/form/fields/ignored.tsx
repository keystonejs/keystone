import type { BasicFormField, FormFieldStoredValue } from '../api'

export function ignored(): BasicFormField<
  { value: FormFieldStoredValue },
  { value: FormFieldStoredValue },
  unknown
> {
  return {
    kind: 'form',
    Input() {
      return null
    },
    defaultValue() {
      return { value: undefined }
    },
    parse(value) {
      return { value }
    },
    serialize(value) {
      return value
    },
    validate(value) {
      return value
    },
    label: 'Ignored',
    reader: {
      parse(value) {
        return value
      },
    },
  }
}
