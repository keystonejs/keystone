import type { BasicFormField } from '../../api'
import { FieldDataError } from '../error'
import type { RequiredValidation} from '../utils';
import { assertRequired, basicFormFieldWithSimpleReaderParse } from '../utils'
import { DateFieldInput } from '#field-ui/date'
import { validateDate } from './validateDate'

export function date<IsRequired extends boolean | undefined>({
  label,
  defaultValue,
  validation,
  description,
}: {
  label: string
  defaultValue?: string | { kind: 'today' }
  validation?: { isRequired?: IsRequired; min?: string; max?: string }
  description?: string
} & RequiredValidation<IsRequired>): BasicFormField<
  string | null,
  string | (IsRequired extends true ? never : null)
> {
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return (
        <DateFieldInput
          validation={validation}
          label={label}
          description={description}
          {...props}
        />
      )
    },
    defaultValue() {
      if (defaultValue === undefined) {
        return null
      }
      if (typeof defaultValue === 'string') {
        return defaultValue
      }
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    parse(value) {
      if (value === undefined) {
        return null
      }
      if (value instanceof Date) {
        const year = value.getUTCFullYear()
        const month = String(value.getUTCMonth() + 1).padStart(2, '0')
        const day = String(value.getUTCDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      if (typeof value !== 'string') {
        throw new FieldDataError('Must be a string')
      }
      return value
    },
    serialize(value) {
      if (value === null) return { value: undefined }
      const date = new Date(value)
      date.toISOString = () => value
      date.toString = () => value
      return { value: date }
    },
    validate(value) {
      const message = validateDate(validation, value, label)
      if (message !== undefined) {
        throw new FieldDataError(message)
      }
      assertRequired(value, validation, label)
      return value
    },
  })
}
