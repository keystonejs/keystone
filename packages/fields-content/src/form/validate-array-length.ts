import type { ArrayField, ComponentSchema, ReadonlyPropPath } from './api.tsx'
import { FieldDataError } from './fields/error.ts'
import { PropValidationError } from './parse-props.ts'

export function validateArrayLength(
  schema: ArrayField<ComponentSchema>,
  val: readonly unknown[],
  path: ReadonlyPropPath
) {
  if (schema.validation?.length?.min !== undefined && val.length < schema.validation.length.min) {
    return new PropValidationError(
      new FieldDataError(
        `Must have at least ${schema.validation.length.min} element${
          schema.validation.length.min === 1 ? '' : 's'
        }`
      ),
      path,
      schema
    )
  }
  if (schema.validation?.length?.max !== undefined && val.length > schema.validation.length.max) {
    return new PropValidationError(
      new FieldDataError(
        `Must have at most ${schema.validation.length.max} element${
          schema.validation.length.max === 1 ? '' : 's'
        }}`
      ),
      path,
      schema
    )
  }
}
