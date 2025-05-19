import type { BasicFormField } from '../../api'
import { FieldDataError } from '../error'
import { basicFormFieldWithSimpleReaderParse } from '../utils'
import { MultiselectFieldInput } from '#field-ui/multiselect'

export function multiselect<const Option extends { label: string; value: string }>({
  label,
  options,
  defaultValue = [],
  description,
}: {
  label: string
  options: readonly Option[]
  defaultValue?: readonly Option['value'][]
  description?: string
}): BasicFormField<readonly Option['value'][]> & {
  options: readonly Option[]
} {
  const valuesToOption = new Map(options.map(x => [x.value, x]))
  const field: BasicFormField<readonly Option['value'][]> = basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return (
        <MultiselectFieldInput
          label={label}
          description={description}
          options={options}
          {...props}
        />
      )
    },
    defaultValue() {
      return defaultValue
    },
    parse(value) {
      if (value === undefined) {
        return []
      }
      if (!Array.isArray(value)) {
        throw new FieldDataError('Must be an array of options')
      }
      if (
        !value.every((x): x is Option['value'] => typeof x === 'string' && valuesToOption.has(x))
      ) {
        throw new FieldDataError(
          `Must be an array with one of ${options.map(x => x.value).join(', ')}`
        )
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
