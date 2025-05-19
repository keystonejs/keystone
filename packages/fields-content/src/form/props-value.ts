import { assertNever, assert } from 'emery/assertions'
import type { ComponentSchema, ParsedValueForComponentSchema, ReadonlyPropPath } from './api'
import { setKeysForArrayValue, getKeysForArrayValue } from './initial-values'

export function getValueAtPropPath(value: unknown, inputPath: ReadonlyPropPath) {
  const path = [...inputPath]
  while (path.length) {
    const key = path.shift()!
    value = (value as any)[key]
  }
  return value
}

export function traverseProps(
  schema: ComponentSchema,
  value: unknown,
  visitor: (schema: ComponentSchema, value: unknown, path: ReadonlyPropPath) => void,
  path: ReadonlyPropPath = []
) {
  if (schema.kind === 'form') {
    visitor(schema, value, path)
    return
  }
  if (schema.kind === 'object') {
    for (const [key, childProp] of Object.entries(schema.fields)) {
      traverseProps(childProp, (value as any)[key], visitor, [...path, key])
    }
    visitor(schema, value, path)
    return
  }
  if (schema.kind === 'array') {
    for (const [idx, val] of (value as unknown[]).entries()) {
      traverseProps(schema.element, val, visitor, path.concat(idx))
    }
    return visitor(schema, value, path)
  }
  if (schema.kind === 'conditional') {
    const discriminant: string | boolean = (value as any).discriminant
    visitor(schema, discriminant, path.concat('discriminant'))
    traverseProps(
      schema.values[discriminant.toString()],
      (value as any).value,
      visitor,
      path.concat('value')
    )
    visitor(schema, value, path)
    return
  }
  assertNever(schema)
}

export function transformProps(
  schema: ComponentSchema,
  value: unknown,
  visitors: {
    [Kind in ComponentSchema['kind']]?: (
      schema: Extract<ComponentSchema, { kind: Kind }>,
      value: ParsedValueForComponentSchema<Extract<ComponentSchema, { kind: Kind }>>,
      path: ReadonlyPropPath
    ) => ParsedValueForComponentSchema<Extract<ComponentSchema, { kind: Kind }>>
  },
  path: ReadonlyPropPath = []
): unknown {
  if (schema.kind === 'form') {
    if (visitors[schema.kind]) {
      return (visitors[schema.kind] as any)(schema, value, path)
    }
    return value
  }
  if (schema.kind === 'object') {
    const val = Object.fromEntries(
      Object.entries(schema.fields).map(([key, val]) => {
        return [key, transformProps(val, (value as any)[key], visitors, [...path, key])]
      })
    )
    if (visitors.object) {
      return (visitors[schema.kind] as any)(schema, val, path)
    }
    return val
  }
  if (schema.kind === 'array') {
    const val = (value as unknown[]).map((val, idx) =>
      transformProps(schema.element, val, visitors, path.concat(idx))
    )
    if (visitors.array) {
      return (visitors[schema.kind] as any)(schema, val, path)
    }
    return val
  }
  if (schema.kind === 'conditional') {
    const discriminant = transformProps(
      schema.discriminant,
      (value as any).discriminant,
      visitors,
      path.concat('discriminant')
    ) as string | boolean
    const conditionalVal = transformProps(
      schema.values[discriminant.toString()],
      (value as any).value,
      visitors,
      path.concat('value')
    )

    const val = {
      discriminant,
      value: conditionalVal,
    }
    if (visitors.conditional) {
      return (visitors[schema.kind] as any)(schema, val, path)
    }
    return val
  }
  assertNever(schema)
}

export async function asyncTransformProps(
  schema: ComponentSchema,
  value: unknown,
  visitors: {
    [Kind in ComponentSchema['kind']]?: (
      schema: Extract<ComponentSchema, { kind: Kind }>,
      value: ParsedValueForComponentSchema<Extract<ComponentSchema, { kind: Kind }>>,
      path: ReadonlyPropPath
    ) => Promise<ParsedValueForComponentSchema<Extract<ComponentSchema, { kind: Kind }>>>
  },
  path: ReadonlyPropPath = []
): Promise<unknown> {
  if (schema.kind === 'form') {
    if (visitors[schema.kind]) {
      return (visitors[schema.kind] as any)(schema, value, path)
    }
    return value
  }
  if (schema.kind === 'object') {
    const val = Object.fromEntries(
      await Promise.all(
        Object.entries(schema.fields).map(async ([key, val]) => {
          return [
            key,
            await asyncTransformProps(val, (value as any)[key], visitors, [...path, key]),
          ]
        })
      )
    )
    if (visitors.object) {
      return (visitors[schema.kind] as any)(schema, val, path)
    }
    return val
  }
  if (schema.kind === 'array') {
    const val = await Promise.all(
      (value as unknown[]).map((val, idx) =>
        asyncTransformProps(schema.element, val, visitors, path.concat(idx))
      )
    )
    if (visitors.array) {
      return (visitors[schema.kind] as any)(schema, val, path)
    }
    return val
  }
  if (schema.kind === 'conditional') {
    const discriminant = (await asyncTransformProps(
      schema.discriminant,
      (value as any).discriminant,
      visitors,
      path.concat('discriminant')
    )) as string | boolean
    const conditionalVal = await asyncTransformProps(
      schema.values[discriminant.toString()],
      (value as any).value,
      visitors,
      path.concat('value')
    )

    const val = {
      discriminant,
      value: conditionalVal,
    }
    if (visitors.conditional) {
      return (visitors[schema.kind] as any)(schema, val, path)
    }
    return val
  }
  assertNever(schema)
}

export function replaceValueAtPropPath(
  schema: ComponentSchema,
  value: unknown,
  newValue: unknown,
  path: ReadonlyPropPath
): unknown {
  if (path.length === 0) {
    return newValue
  }

  const [key, ...newPath] = path

  if (schema.kind === 'object') {
    return {
      ...(value as any),
      [key]: replaceValueAtPropPath(schema.fields[key], (value as any)[key], newValue, newPath),
    }
  }

  if (schema.kind === 'conditional') {
    const conditionalValue = value as {
      discriminant: string | boolean
      value: unknown
    }
    // replaceValueAtPropPath should not be used to only update the discriminant of a conditional field
    // if you want to update the discriminant of a conditional field, replace the value of the whole conditional field
    assert(key === 'value')
    return {
      discriminant: conditionalValue.discriminant,
      value: replaceValueAtPropPath(schema.values[key], conditionalValue.value, newValue, newPath),
    }
  }

  if (schema.kind === 'array') {
    const prevVal = value as unknown[]
    const newVal = [...prevVal]
    setKeysForArrayValue(newVal, getKeysForArrayValue(prevVal))
    newVal[key as number] = replaceValueAtPropPath(
      schema.element,
      newVal[key as number],
      newValue,
      newPath
    )
    return newVal
  }

  // we should never reach here since form fields don't contain other fields
  // so the only thing that can happen to them is to be replaced which happens at the start of this function when path.length === 0
  assert(schema.kind !== 'form')

  assertNever(schema)
}
