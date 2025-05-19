import type { ComponentSchema, ReadonlyPropPath } from './api'
import { PropValidationError } from './parse-props'
import { validateArrayLength } from './validate-array-length'
import { toFormattedFormDataError } from './error-formatting'

export function clientSideValidateProp(schema: ComponentSchema, value: any) {
  try {
    validateValueWithSchema(schema, value)
    return true
  } catch (error) {
    console.warn(toFormattedFormDataError(error))
    return false
  }
}

function validateValueWithSchema(
  schema: ComponentSchema,
  value: any,
  path: ReadonlyPropPath = []
): void {
  switch (schema.kind) {
    case 'form': {
      try {
        schema.validate(value)
      } catch (err) {
        throw new PropValidationError(err, path, schema)
      }
      return
    }
    case 'conditional': {
      schema.discriminant.validate(value.discriminant)
      validateValueWithSchema(schema.values[value.discriminant], value.value, path.concat('value'))
      return
    }
    case 'object': {
      const errors: unknown[] = []
      for (const [key, childProp] of Object.entries(schema.fields)) {
        try {
          validateValueWithSchema(childProp, value[key], path.concat(key))
        } catch (err) {
          errors.push(err)
        }
      }
      if (errors.length > 0) {
        throw new AggregateError(errors)
      }
      return
    }
    case 'array': {
      const errors: unknown[] = []
      const val = value as unknown[]
      const error = validateArrayLength(schema, value, path)
      if (error !== undefined) {
        errors.push(error)
      }
      for (const [idx, innerVal] of val.entries()) {
        try {
          validateValueWithSchema(schema.element, innerVal, path.concat(idx))
        } catch (err) {
          errors.push(err)
        }
      }
      if (errors.length > 0) {
        throw new AggregateError(errors)
      }
      return
    }
  }
}
