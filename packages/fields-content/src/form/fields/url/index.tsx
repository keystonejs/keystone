import type { BasicFormField } from '../../api.tsx'
import { FieldDataError } from '../error.ts'
import type { RequiredValidation } from '../utils.tsx'
import { assertRequired, basicFormFieldWithSimpleReaderParse } from '../utils.tsx'
import { UrlFieldInput } from '#field-ui/url'
import { validateUrl } from './validateUrl.tsx'

export function url<IsRequired extends boolean | undefined>({
  label,
  defaultValue,
  validation,
  description,
}: {
  label: string
  defaultValue?: string
  validation?: { isRequired?: IsRequired }
  description?: string
} & RequiredValidation<IsRequired>): BasicFormField<
  string | null,
  string | (IsRequired extends true ? never : null)
> {
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return (
        <UrlFieldInput label={label} description={description} validation={validation} {...props} />
      )
    },
    defaultValue() {
      return defaultValue || null
    },
    parse(value) {
      if (value === undefined) {
        return null
      }
      if (typeof value !== 'string') {
        throw new FieldDataError('Must be a string')
      }
      return value === '' ? null : value
    },
    validate(value) {
      const message = validateUrl(validation, value, label)
      if (message !== undefined) {
        throw new FieldDataError(message)
      }
      assertRequired(value, validation, label)
      return value
    },
    serialize(value) {
      return { value: value === null ? undefined : value }
    },
  })
}
