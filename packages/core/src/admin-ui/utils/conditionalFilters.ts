import type { BaseListTypeInfo, ConditionalFilter, ConditionalFilterCase } from '../../types'

type SerializedItem = Record<string, unknown>
type SerializableFields = Record<
  string,
  {
    controller: {
      serialize(value: unknown): Record<string, unknown>
    }
  }
>

// with implicit ANDing
function applyFilter<T>(
  filter: {
    equals?: T
    in?: T[]
  },
  val: T
): boolean {
  if (filter.equals !== undefined && val !== filter.equals) return false
  if (filter.in !== undefined && !filter.in.includes(val)) return false
  return true
}

export function testFilter(
  filter: ConditionalFilterCase<BaseListTypeInfo> | undefined,
  serialized: SerializedItem
): boolean {
  if (filter === undefined) return false
  if (typeof filter === 'boolean') return filter
  for (const [key, filterOnField] of Object.entries(filter)) {
    if (!filterOnField) continue
    const serializedValue = serialized[key]
    if (!applyFilter(filterOnField, serializedValue)) return false
    if (filterOnField.not !== undefined && applyFilter(filterOnField.not, serializedValue)) {
      return false
    }
  }
  return true
}

export function serializeItemForConditionalFilters(
  fields: SerializableFields,
  itemValue: Record<string, unknown>
): SerializedItem {
  const serialized: SerializedItem = {}
  for (const [fieldKey, field] of Object.entries(fields)) {
    Object.assign(serialized, field.controller.serialize(itemValue[fieldKey]))
  }
  return serialized
}

export function resolveConditionalActionMode(
  actionMode: ConditionalFilter<'enabled' | 'disabled' | 'hidden', BaseListTypeInfo>,
  serialized: SerializedItem
): 'enabled' | 'disabled' | 'hidden' {
  if (typeof actionMode === 'string') return actionMode
  if (testFilter(actionMode.enabled, serialized)) return 'enabled'
  if (testFilter(actionMode.disabled, serialized)) return 'disabled'
  return 'hidden'
}
