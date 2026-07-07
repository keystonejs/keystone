import type {
  ActionMeta,
  BaseListTypeInfo,
  ConditionalFilter,
  ConditionalFilterCase,
  FieldMeta,
} from '../../types'

type SerializedItem = Record<string, unknown>
type FieldFilter = {
  equals?: unknown
  in?: unknown[]
  not?: {
    equals?: unknown
    in?: unknown[]
  }
}

function isConditionalFilterOperator(key: string): key is 'AND' | 'OR' | 'NOT' {
  return key === 'AND' || key === 'OR' || key === 'NOT'
}

function isFieldFilter(value: unknown): value is FieldFilter {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

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

  if (filter.AND !== undefined && !filter.AND.every(filter => testFilter(filter, serialized))) {
    return false
  }
  if (filter.OR !== undefined && !filter.OR.some(filter => testFilter(filter, serialized))) {
    return false
  }
  if (filter.NOT !== undefined && testFilter(filter.NOT, serialized)) {
    return false
  }

  for (const [key, fieldFilter] of Object.entries(filter)) {
    if (!isFieldFilter(fieldFilter)) continue
    if (isConditionalFilterOperator(key)) continue

    const serializedValue = serialized[key]
    if (!applyFilter(fieldFilter, serializedValue)) return false
    if (fieldFilter.not !== undefined && applyFilter(fieldFilter.not, serializedValue)) {
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

export function isActionAvailable(
  action: ActionMeta,
  { actionMode }: ActionMeta['listView'] | ActionMeta['itemView']
): boolean {
  if (action.graphql.arguments.some(a => !a.source)) return false

  // conditional filters cannot be prefiltered ahead of time
  if (typeof actionMode !== 'string') return true
  return actionMode !== 'hidden'
}

export function getConditionalFilterCaseFieldKeys(
  filter: ConditionalFilterCase<BaseListTypeInfo> | null | undefined
): string[] {
  const fieldKeys = new Set<string>()

  function collectFieldKeys(filter: ConditionalFilterCase<BaseListTypeInfo> | undefined) {
    if (!filter || typeof filter !== 'object') return

    if (filter.AND !== undefined) {
      filter.AND.forEach(collectFieldKeys)
    }
    if (filter.OR !== undefined) {
      filter.OR.forEach(collectFieldKeys)
    }
    if (filter.NOT !== undefined) {
      collectFieldKeys(filter.NOT)
    }

    for (const key of Object.keys(filter)) {
      if (isConditionalFilterOperator(key)) continue
      fieldKeys.add(key)
    }
  }

  collectFieldKeys(filter ?? undefined)

  return [...fieldKeys]
}

export function getConditionalFilterFieldKeys(
  conditionalFilter: ConditionalFilter<string, string, BaseListTypeInfo> | null | undefined
): string[] {
  if (typeof conditionalFilter !== 'object' || conditionalFilter === null) return []

  const fieldKeys = new Set<string>()
  for (const filterCase of Object.values(conditionalFilter)) {
    for (const fieldKey of getConditionalFilterCaseFieldKeys(filterCase)) {
      fieldKeys.add(fieldKey)
    }
  }

  return [...fieldKeys]
}
