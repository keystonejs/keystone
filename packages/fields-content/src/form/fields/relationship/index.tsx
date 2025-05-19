import type { BasicFormField } from '../../api'
import { FieldDataError } from '../error'
import { basicFormFieldWithSimpleReaderParse } from '../utils'
import { SelectFieldInput } from '#field-ui/select'

export function relationship<Many extends boolean | undefined = false>({
  label,
  options,
  defaultValue,
  description,
}: {
  label: string
  description?: string
} & (Many extends undefined | false ? { many?: Many } : { many: Many })): BasicFormField<
  Many extends true ? { id: string }[] : { id: string },
  Many extends true ? { id: string }[] : { id: string } | null
> {
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return (
        <SelectFieldInput label={label} options={options} description={description} {...props} />
      )
    },
    defaultValue() {
      return defaultValue
    },
    parse(value) {
      if (value === undefined) {
        return defaultValue
      }
      if (typeof value !== 'string') {
        throw new FieldDataError('Must be a string')
      }
      if (!optionValuesSet.has(value)) {
        throw new FieldDataError('Must be a valid option')
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
  return {
    ...field,
    options,
  }
}
