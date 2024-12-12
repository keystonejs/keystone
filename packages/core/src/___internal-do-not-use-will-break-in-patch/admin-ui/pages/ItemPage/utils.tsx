import { useMemo } from 'react'
import {
  getRootGraphQLFieldsFromFieldController,
} from '../../../../admin-ui/utils'
import isDeepEqual from 'fast-deep-equal'
import type {
  FieldMeta,
  JSONValue
} from '../../../../types'

export function deserializeItemToValue (
  fields: Record<string, FieldMeta>,
  item: Record<string, unknown | null>
) {
  const result: Record<string, unknown | null> = {}
  for (const fieldKey in fields) {
    const field = fields[fieldKey]
    const itemForField: Record<string, unknown> = {}
    for (const graphqlField of getRootGraphQLFieldsFromFieldController(field.controller)) {
      itemForField[graphqlField] = item?.[graphqlField] ?? null
    }
    result[fieldKey] = field.controller.deserialize(itemForField)
  }
  return result
}

function serializeValueToItem (
  fields: Record<string, FieldMeta>,
  value: Record<string, unknown>
) {
  const result: Record<string, Record<string, JSONValue>> = {}
  for (const fieldKey in fields) {
    const fieldValue = value[fieldKey]
    result[fieldKey] = fields[fieldKey].controller.serialize(fieldValue)
  }
  return result
}

export function useChangedFieldsAndDataForUpdate (
  fields: Record<string, FieldMeta>,
  item: Record<string, unknown>,
  value: Record<string, unknown>,
) {
  const serializedItem = useMemo(() => serializeValueToItem(fields, value), [fields, value])
  const serializedValuesFromItem = useMemo(() => {
    const value2 = deserializeItemToValue(fields, item)
    return serializeValueToItem(fields, value2)
  }, [fields, item])

  return useMemo(() => {
    const changedFields = new Set<string>()
    for (const fieldKey in serializedItem) {
      const isEqual = isDeepEqual(
        serializedItem[fieldKey],
        serializedValuesFromItem[fieldKey]
      )
      if (!isEqual) {
        changedFields.add(fieldKey)
      }
    }

    const dataForUpdate: Record<string, any> = {}
    for (const fieldKey of changedFields) {
      Object.assign(dataForUpdate, serializedItem[fieldKey])
    }

    Object.keys(serializedItem)
      .filter(fieldKey => fields[fieldKey].graphql.isNonNull?.includes('update'))
      .filter(fieldKey => !changedFields.has(fieldKey))
      .forEach(fieldKey => {
        Object.assign(dataForUpdate, serializedItem[fieldKey])
      })

    return {
      hasChangedFields: changedFields.size > 0,
      dataForUpdate
    }
  }, [serializedItem, serializedValuesFromItem, fields])
}
