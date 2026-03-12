import type {
  ActionMeta,
  BaseListTypeInfo,
  ConditionalFilter,
  ConditionalFilterCase,
  FieldMeta,
} from '../../types'

type SerializedItem = Record<string, unknown>

function applyFilter<T>(
  filter: {
    equals?: T
    in?: T[]
  },
  value: T
): boolean {
  // WARNING: this is implicit AND
  if (filter.equals !== undefined && value !== filter.equals) return false
  if (filter.in !== undefined && !filter.in.includes(value)) return false
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
  fields: Record<string, FieldMeta>,
  itemValue: Record<string, unknown>
): SerializedItem {
  const serialized: SerializedItem = {}
  for (const [fieldKey, field] of Object.entries(fields)) {
    Object.assign(serialized, field.controller.serialize(itemValue[fieldKey]))
  }
  return serialized
}

export function resolveActionMode(
  actionMode: ConditionalFilter<
    'enabled' | 'disabled' | 'hidden',
    'disabled' | 'hidden',
    BaseListTypeInfo
  >,
  serialized: SerializedItem
): 'enabled' | 'disabled' | 'hidden' {
  if (typeof actionMode === 'string') return actionMode
  if (testFilter(actionMode.hidden, serialized)) return 'hidden'
  if (testFilter(actionMode.disabled, serialized)) return 'disabled'
  return 'enabled'
}

export function resolveFieldMode(
  fieldMode: ConditionalFilter<'edit' | 'read' | 'hidden', 'read' | 'hidden', BaseListTypeInfo>,
  serialized: SerializedItem,
  view: 'createView' | 'itemView'
) {
  if (typeof fieldMode === 'string') return fieldMode
  if (testFilter(fieldMode.hidden, serialized)) return 'hidden'
  if (view === 'itemView' && testFilter(fieldMode.read, serialized)) return 'read'
  return 'edit'
}

export function isActionAvailable({
  actionMode,
}: ActionMeta['listView'] | ActionMeta['itemView']): boolean {
  // conditional filters cannot be prefiltered ahead of time
  if (typeof actionMode !== 'string') return true
  return actionMode === 'enabled'
}

export function getConditionalFilterFieldKeys(
  actionMode: ConditionalFilter<string, string, BaseListTypeInfo>
): string[] {
  if (typeof actionMode === 'string') return []

  const fieldKeys: string[] = []
  for (const conditionalFilter of Object.values(actionMode)) {
    if (!conditionalFilter || typeof conditionalFilter !== 'object') continue
    fieldKeys.push(...Object.keys(conditionalFilter))
  }

  return fieldKeys
}
