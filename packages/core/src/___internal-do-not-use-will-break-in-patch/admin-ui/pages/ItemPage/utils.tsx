import { useMemo } from 'react'
import {
  getRootGraphQLFieldsFromFieldController,
} from '../../../../admin-ui/utils'
import isDeepEqual from 'fast-deep-equal'
import type { FieldMeta } from '../../../../types'

export function deserializeItemValue (
  fields: Record<string, FieldMeta>,
  data: Record<string, unknown | null>
) {
  const value: Record<string, unknown | null> = {}
  for (const fieldKey in fields) {
    const field = fields[fieldKey]
    const itemForField: Record<string, unknown> = {}
    for (const graphqlField of getRootGraphQLFieldsFromFieldController(field.controller)) {
      itemForField[graphqlField] = data?.[graphqlField] ?? null
    }
    value[fieldKey] = field.controller.deserialize(itemForField)
  }
  return value
}

// function serializeValueToObjByFieldKey (
//   fields: Record<string, FieldMeta>,
//   value: DeserializedValue
// ) {
//   const obj: Record<string, Record<string, JSONValue>> = {}
//   Object.keys(fields).map(fieldKey => {
//     const val = value[fieldKey]
//     if (val.kind === 'value') {
//       obj[fieldKey] = fields[fieldKey].controller.serialize(val.value)
//     }
//   })
//   return obj
// }

export function useChangedFieldsAndDataForUpdate (
  fields: Record<string, FieldMeta>,
  item: Record<string, unknown>,
  value: Record<string, unknown>,
) {
  const serializedValuesFromItem = useMemo(() => {
    const value = deserializeValue(fields, itemGetter)
    return serializeValueToObjByFieldKey(fields, value)
  }, [fields, itemGetter])
  const serializedFieldValues = useMemo(() => {
    return serializeValueToObjByFieldKey(fields, value)
  }, [value, fields])

  return useMemo(() => {
    const changedFields = new Set<string>()
    Object.keys(serializedFieldValues).forEach(fieldKey => {
      const isEqual = isDeepEqual(
        serializedFieldValues[fieldKey],
        serializedValuesFromItem[fieldKey]
      )
      if (!isEqual) {
        changedFields.add(fieldKey)
      }
    })

    const dataForUpdate: Record<string, any> = {}
    changedFields.forEach(fieldKey => {
      Object.assign(dataForUpdate, serializedFieldValues[fieldKey])
    })

    Object.keys(serializedFieldValues)
      .filter(fieldKey => fields[fieldKey].graphql.isNonNull?.includes('update'))
      .filter(fieldKey => !changedFields.has(fieldKey))
      .forEach(fieldKey => {
        Object.assign(dataForUpdate, serializedFieldValues[fieldKey])
      })

    return { changedFields: changedFields as ReadonlySet<string>, dataForUpdate }
  }, [serializedFieldValues, serializedValuesFromItem, fields])
}
