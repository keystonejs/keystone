import type { BasicFormField } from '../../api'
import { FieldDataError } from '../error'
import type { RequiredValidation} from '../utils';
import { assertRequired, basicFormFieldWithSimpleReaderParse } from '../utils'
import { IntegerFieldInput } from '#field-ui/integer'
import { validateInteger } from './validateInteger'

export function integer<IsRequired extends boolean | undefined>({
  label,
  defaultValue,
  validation,
  description,
}: {
  label: string
  defaultValue?: number
  validation?: { isRequired?: IsRequired; min?: number; max?: number }
  description?: string
} & RequiredValidation<IsRequired>): BasicFormField<
  number | null,
  number | (IsRequired extends true ? never : null)
> {
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return (
        <IntegerFieldInput
          label={label}
          description={description}
          validation={validation}
          {...props}
        />
      )
    },
    defaultValue() {
      return defaultValue ?? null
    },
    parse(value) {
      if (value === undefined) {
        return null
      }
      if (typeof value === 'number') {
        return value
      }
      throw new FieldDataError('Must be a number')
    },
    validate(value) {
      const message = validateInteger(validation, value, label)
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
