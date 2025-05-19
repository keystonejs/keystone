import type { BasicFormField } from '../../api'
import { FieldDataError } from '../error'
import { basicFormFieldWithSimpleReaderParse } from '../utils'
import { SelectFieldInput } from '#field-ui/select'

export function select<const Option extends { label: string; value: string }>({
  label,
  options,
  defaultValue,
  description,
}: {
  label: string
  options: readonly Option[]
  defaultValue: Option['value']
  description?: string
}): BasicFormField<Option['value']> & {
  options: readonly Option[]
} {
  const optionValuesSet = new Set(options.map(x => x.value))
  if (!optionValuesSet.has(defaultValue)) {
    throw new Error(
      `A defaultValue of ${defaultValue} was provided to a select field but it does not match the value of one of the options provided`
    )
  }
  const field: BasicFormField<Option['value']> = basicFormFieldWithSimpleReaderParse({
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
