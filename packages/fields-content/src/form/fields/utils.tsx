import type { ReactElement } from 'react'
import type { BasicFormField, FormFieldInputProps, FormFieldStoredValue } from '../api'
import { FieldDataError } from './error'

export type RequiredValidation<IsRequired extends boolean | undefined> = IsRequired extends true
  ? { validation: { isRequired: true } }
  : unknown

export function assertRequired<T, IsRequired extends boolean | undefined>(
  value: T | null,
  validation: undefined | { isRequired?: IsRequired },
  label: string
): asserts value is T | (IsRequired extends true ? never : null) {
  if (value === null && validation?.isRequired) {
    throw new FieldDataError(`${label} is required`)
  }
}

export function basicFormFieldWithSimpleReaderParse<
  ParsedValue extends {} | null,
  ValidatedValue extends ParsedValue,
>(config: {
  Input(props: FormFieldInputProps<ParsedValue>): ReactElement | null
  defaultValue(): ParsedValue
  parse(value: FormFieldStoredValue): ParsedValue
  /**
   * If undefined is returned, the field will generally not be written,
   * except in array fields where it will be stored as null
   */
  serialize(value: ParsedValue): { value: FormFieldStoredValue }
  validate(value: ParsedValue): ValidatedValue
  label: string
}): BasicFormField<ParsedValue, ValidatedValue, ValidatedValue> {
  return {
    kind: 'form',
    Input: config.Input,
    defaultValue: config.defaultValue,
    parse: config.parse,
    serialize: config.serialize,
    validate: config.validate,
    reader: {
      parse(value) {
        return config.validate(config.parse(value))
      },
    },
    label: config.label,
  }
}
