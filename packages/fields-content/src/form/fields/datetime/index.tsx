import type { BasicFormField } from '../../api'
import { FieldDataError } from '../error'
import type { RequiredValidation} from '../utils';
import { assertRequired, basicFormFieldWithSimpleReaderParse } from '../utils'
import { DatetimeFieldInput } from '#field-ui/datetime'
import { validateDatetime } from './validateDatetime'

export function datetime<IsRequired extends boolean | undefined>({
  label,
  defaultValue,
  validation,
  description,
}: {
  label: string
  defaultValue?: string | { kind: 'now' }
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
        <DatetimeFieldInput
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
      if (defaultValue.kind === 'now') {
        const now = new Date()
        return new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000)
          .toISOString()
          .slice(0, -8)
      }
      return null
    },
    parse(value) {
      if (value === undefined) {
        return null
      }
      if (value instanceof Date) {
        return value.toISOString().slice(0, -8)
      }
      if (typeof value !== 'string') {
        throw new FieldDataError('Must be a string or date')
      }
      return value
    },
    serialize(value) {
      if (value === null) return { value: undefined }
      const date = new Date(value + 'Z')
      date.toJSON = () => date.toISOString().slice(0, -8)
      date.toString = () => date.toISOString().slice(0, -8)
      return { value: date }
    },
    validate(value) {
      const message = validateDatetime(validation, value, label)
      if (message !== undefined) {
        throw new FieldDataError(message)
      }
      assertRequired(value, validation, label)
      return value
    },
  })
}
