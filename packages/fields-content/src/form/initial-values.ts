import { assertNever } from 'emery'

import type { ComponentSchema, ParsedValueForComponentSchema } from './api'

const arrayValuesToElementKeys = new WeakMap<readonly unknown[], readonly string[]>()

let counter = 0

export function getKeysForArrayValue(value: readonly unknown[]) {
  if (!arrayValuesToElementKeys.has(value)) {
    arrayValuesToElementKeys.set(value, Array.from({ length: value.length }, getNewArrayElementKey))
  }
  return arrayValuesToElementKeys.get(value)!
}

export function setKeysForArrayValue(value: readonly unknown[], elementIds: readonly string[]) {
  arrayValuesToElementKeys.set(value, elementIds)
}

export function getNewArrayElementKey() {
  return (counter++).toString()
}

export const getInitialPropsValue = _getInitialPropsValue as <Schema extends ComponentSchema>(
  schema: Schema
) => ParsedValueForComponentSchema<Schema>

function _getInitialPropsValue(schema: ComponentSchema): unknown {
  switch (schema.kind) {
    case 'form':
      return schema.defaultValue()
    case 'conditional': {
      const defaultValue = schema.discriminant.defaultValue()
      return {
        discriminant: defaultValue,
        value: getInitialPropsValue(schema.values[defaultValue.toString()]),
      }
    }
    case 'object': {
      const obj: Record<string, any> = {}
      for (const key of Object.keys(schema.fields)) {
        obj[key] = getInitialPropsValue(schema.fields[key])
      }
      return obj
    }
    case 'array': {
      return []
    }
  }
  assertNever(schema)
}

export function getInitialPropsValueFromInitializer(
  schema: ComponentSchema,
  initializer: any
): any {
  switch (schema.kind) {
    case 'form':
      return initializer === undefined ? schema.defaultValue() : initializer
    case 'conditional': {
      const defaultValue =
        initializer === undefined ? schema.discriminant.defaultValue() : initializer.discriminant
      return {
        discriminant: defaultValue,
        value: getInitialPropsValueFromInitializer(
          schema.values[defaultValue.toString()],
          initializer === undefined ? undefined : initializer.value
        ),
      }
    }
    case 'object': {
      const obj: Record<string, any> = {}
      for (const key of Object.keys(schema.fields)) {
        obj[key] = getInitialPropsValueFromInitializer(
          schema.fields[key],
          initializer === undefined ? undefined : initializer[key]
        )
      }
      return obj
    }
    case 'array': {
      return ((initializer ?? []) as { value?: unknown }[]).map(x =>
        getInitialPropsValueFromInitializer(schema.element, x.value)
      )
    }
  }
  assertNever(schema)
}

export function updateValue(schema: ComponentSchema, currentValue: any, updater: any): any {
  if (updater === undefined) return currentValue

  switch (schema.kind) {
    case 'form':
      return updater
    case 'conditional': {
      return {
        discriminant: updater.discriminant,
        value:
          updater.discriminant === currentValue.discriminant
            ? updateValue(
                schema.values[updater.discriminant.toString()],
                currentValue.value,
                updater.value
              )
            : getInitialPropsValueFromInitializer(
                schema.values[updater.discriminant.toString()],
                updater.value
              ),
      }
    }
    case 'object': {
      const obj: Record<string, any> = {}
      for (const key of Object.keys(schema.fields)) {
        obj[key] = updateValue(schema.fields[key], currentValue[key], updater[key])
      }
      return obj
    }
    case 'array': {
      const currentArrVal = currentValue as unknown[]
      const newVal = updater as { key: string | undefined; value: unknown }[]
      const uniqueKeys = new Set()
      for (const x of newVal) {
        if (x.key !== undefined) {
          if (uniqueKeys.has(x.key)) {
            throw new Error('Array elements must have unique keys')
          }
          uniqueKeys.add(x.key)
        }
      }
      const keys = newVal.map(x => {
        if (x.key !== undefined) return x.key
        let elementKey = getNewArrayElementKey()
        // just in case someone gives a key that is above our counter
        while (uniqueKeys.has(elementKey)) {
          elementKey = getNewArrayElementKey()
        }
        uniqueKeys.add(elementKey)
        return elementKey
      })
      const prevKeys = getKeysForArrayValue(currentArrVal)
      const prevValuesByKey = new Map(
        currentArrVal.map((value, i) => {
          return [prevKeys[i], value]
        })
      )
      const val = newVal.map((x, i) => {
        const id = keys[i]
        if (prevValuesByKey.has(id)) {
          return updateValue(schema.element, prevValuesByKey.get(id), x.value)
        }
        return getInitialPropsValueFromInitializer(schema.element, x.value)
      })
      setKeysForArrayValue(val, keys)
      return val
    }
  }
  assertNever(schema)
}
