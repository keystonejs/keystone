import {
  type ComponentSchema,
  type ComponentBlock
} from './api-shared'
import { getKeysForArrayValue, getNewArrayElementKey, setKeysForArrayValue } from './preview-props'
import { assertNever, findChildPropPaths } from './utils'

export function getInitialValue (type: string, componentBlock: ComponentBlock) {
  const props = getInitialPropsValue({ kind: 'object', fields: componentBlock.schema })
  return {
    type: 'component-block' as const,
    component: type,
    props,
    children: findChildPropPaths(props, componentBlock.schema).map(x => ({
      type: `component-${x.options.kind}-prop` as const,
      propPath: x.path,
      children: [
        x.options.kind === 'block'
          ? { type: 'paragraph' as const, children: [{ text: '' }] }
          : { text: '' },
      ],
    })),
  }
}

export function getInitialPropsValue (schema: ComponentSchema): any {
  switch (schema.kind) {
    case 'form':
      return schema.defaultValue
    case 'child':
      return null
    case 'relationship':
      return schema.many ? [] : null
    case 'conditional': {
      const defaultValue = schema.discriminant.defaultValue
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

export function getInitialPropsValueFromInitializer (
  schema: ComponentSchema,
  initializer: any
): any {
  switch (schema.kind) {
    case 'form':
      return initializer === undefined ? schema.defaultValue : initializer
    case 'child':
      return null
    case 'relationship':
      return initializer === undefined ? (schema.many ? [] : null) : initializer
    case 'conditional': {
      const defaultValue =
        initializer === undefined ? schema.discriminant.defaultValue : initializer.discriminant
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

export function updateValue (schema: ComponentSchema, currentValue: any, updater: any): any {
  if (updater === undefined) return currentValue

  switch (schema.kind) {
    case 'relationship':
      return updater
    case 'form':
      return updater
    case 'child':
      return null
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
      const newVal = updater as { key: string | undefined, value: unknown }[]
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
