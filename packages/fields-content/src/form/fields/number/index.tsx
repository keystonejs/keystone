import type { BasicFormField } from '../../api'
import { FieldDataError } from '../error'
import type { RequiredValidation} from '../utils';
import { assertRequired, basicFormFieldWithSimpleReaderParse } from '../utils'
import { NumberFieldInput } from '#field-ui/number'
import { validateNumber } from './validateNumber'

export function number<IsRequired extends boolean | undefined>({
  label,
  defaultValue,
  step,
  validation,
  description,
}: {
  label: string
  defaultValue?: number
  step?: number
  validation?: {
    isRequired?: IsRequired
    min?: number
    max?: number
    step?: boolean
  }
  description?: string
} & RequiredValidation<IsRequired>): BasicFormField<
  number | null,
  number | (IsRequired extends true ? never : null)
> {
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return (
        <NumberFieldInput
          label={label}
          description={description}
          validation={validation}
          step={step}
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
      const message = validateNumber(validation, value, step, label)
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
