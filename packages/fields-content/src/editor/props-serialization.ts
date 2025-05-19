import { useMemo } from 'react'
import type { ComponentSchema } from '../form/api'
import { formatFormDataError } from '../form/error-formatting'
import { parseProps } from '../form/parse-props'
import { serializeProps } from '../form/serialize-props'

export function deserializeProps(fields: Record<string, ComponentSchema>, value: unknown) {
  try {
    return parseProps(
      { kind: 'object', fields },
      value as any,
      [],
      (schema, value) => {
        return schema.parse(value)
      },
      false
    )
  } catch (err) {
    throw new Error(formatFormDataError(err))
  }
}

export function toSerialized(deserialized: unknown, schema: Record<string, ComponentSchema>) {
  return serializeProps(deserialized, { kind: 'object', fields: schema })
}

export function deserializeValue(value: unknown, schema: Record<string, ComponentSchema>) {
  return deserializeProps(schema, value) as Record<string, unknown>
}

export function internalToSerialized(
  fields: Record<string, ComponentSchema>,
  value: unknown
): Record<string, unknown> {
  const deserialized = deserializeValue(value, fields)
  const serialized = serializeProps(deserialized, { kind: 'object', fields })

  return serialized as Record<string, unknown>
}

export const useDeserializedValue: typeof deserializeValue = function useDeserializedValue(
  value,
  schema
): Record<string, unknown> {
  return useMemo(() => deserializeValue(value, schema), [schema, value])
}
