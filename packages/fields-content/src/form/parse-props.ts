import { assertNever } from 'emery'
import { FieldDataError } from './fields/error'
import { validateArrayLength } from './validate-array-length'
import { getInitialPropsValue } from './initial-values'
import type {
  ReadonlyPropPath,
  ComponentSchema,
  JsonYamlValue,
  FormFieldStoredValue,
  FormField,
} from './api'

export class PropValidationError extends Error {
  path: ReadonlyPropPath
  schema: ComponentSchema
  cause: unknown
  constructor(cause: unknown, path: ReadonlyPropPath, schema: ComponentSchema) {
    super(`field error at ${path.join('.')}`, { cause })
    this.path = path
    this.schema = schema
    this.cause = cause
  }
}

function toFormFieldStoredValue(val: JsonYamlValue | undefined): FormFieldStoredValue {
  if (val === null) {
    return undefined
  }
  return val
}

const isArray: (val: unknown) => val is readonly unknown[] = Array.isArray

export function parseProps(
  schema: ComponentSchema,
  _value: JsonYamlValue | undefined,
  path: ReadonlyPropPath,
  parseFormField: (
    schema: FormField<any, any, any>,
    value: FormFieldStoredValue,
    path: ReadonlyPropPath
  ) => any,
  /** This should be true for the reader and false elsewhere */
  validateArrayFieldLength: boolean
): any {
  let value = toFormFieldStoredValue(_value)
  if (schema.kind === 'form') {
    try {
      return parseFormField(schema, value, path)
    } catch (err) {
      throw new PropValidationError(err, path, schema)
    }
  }
  if (schema.kind === 'conditional') {
    if (value === undefined) {
      return getInitialPropsValue(schema)
    }
    try {
      if (typeof value !== 'object' || value === null || isArray(value) || value instanceof Date) {
        throw new FieldDataError('Must be an object')
      }
      for (const key of Object.keys(value)) {
        if (key !== 'discriminant' && key !== 'value') {
          throw new FieldDataError(
            `Must only contain keys "discriminant" and "value", not "${key}"`
          )
        }
      }
    } catch (err) {
      throw new PropValidationError(err, path, schema)
    }

    const parsedDiscriminant = parseProps(
      schema.discriminant,
      value.discriminant,
      path.concat('discriminant'),
      parseFormField,
      validateArrayFieldLength
    )

    return {
      discriminant: parsedDiscriminant,
      value: parseProps(
        schema.values[parsedDiscriminant],
        value.value,
        path.concat('value'),
        parseFormField,
        validateArrayFieldLength
      ),
    }
  }

  if (schema.kind === 'object') {
    if (value === undefined) {
      value = {}
    }
    try {
      if (typeof value !== 'object' || value === null || isArray(value) || value instanceof Date) {
        throw new FieldDataError('Must be an object')
      }
      const allowedKeysSet = new Set(Object.keys(schema.fields))
      for (const key of Object.keys(value)) {
        if (!allowedKeysSet.has(key)) {
          throw new FieldDataError(`Key on object value "${key}" is not allowed`)
        }
      }
    } catch (err) {
      throw new PropValidationError(err, path, schema)
    }
    const val: Record<string, any> = {}
    const errors: unknown[] = []
    for (const key of Object.keys(schema.fields)) {
      let individualVal = value[key]
      try {
        const propVal = parseProps(
          schema.fields[key],
          individualVal,
          path.concat(key),
          parseFormField,
          validateArrayFieldLength
        )
        val[key] = propVal
      } catch (err) {
        errors.push(err)
      }
    }
    if (errors.length) {
      throw new AggregateError(errors)
    }
    return val
  }
  if (schema.kind === 'array') {
    if (value === undefined) {
      return []
    }
    try {
      if (!isArray(value)) {
        throw new FieldDataError('Must be an array')
      }
    } catch (err) {
      throw new PropValidationError(err, path, schema)
    }
    const errors: unknown[] = []
    try {
      if (validateArrayFieldLength) {
        const error = validateArrayLength(schema, value, path)
        if (error !== undefined) {
          errors.push(error)
        }
      }
      return value.map((innerVal, i) => {
        try {
          return parseProps(
            schema.element,
            innerVal,
            path.concat(i),
            parseFormField,
            validateArrayFieldLength
          )
        } catch (err) {
          errors.push(err)
        }
      })
    } finally {
      if (errors.length) {
        // eslint-disable-next-line no-unsafe-finally
        throw new AggregateError(errors)
      }
    }
  }
  assertNever(schema)
}
