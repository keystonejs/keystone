import { transformProps } from './props-value'
import type { ComponentSchema } from './api'

export function serializeProps(rootValue: unknown, rootSchema: ComponentSchema) {
  return transformProps(rootSchema, rootValue, {
    form(schema, value) {
      return schema.serialize(value).value
    },
    object(_schema, value) {
      return Object.fromEntries(Object.entries(value).filter(([_, val]) => val !== undefined))
    },
    array(_schema, value) {
      return value.map(val => (val === undefined ? null : val))
    },
    conditional(_schema, value) {
      if (value.value === undefined) {
        return { discriminant: value.discriminant } as any
      }
      return value
    },
  })
}
