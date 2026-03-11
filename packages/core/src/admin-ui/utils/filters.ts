import type {
  ActionMeta,
  BaseListTypeInfo,
  ConditionalFilter,
  ConditionalFilterCase,
  FieldMeta,
} from '../../types'

type SerializedItem = Record<string, unknown>
const conditionalFilterOperators = new Set(['AND', 'OR', 'NOT'])
type FieldFilter = {
  equals?: unknown
  in?: unknown[]
  not?: {
    equals?: unknown
    in?: unknown[]
  }
}

function isConditionalFilterOperator(key: string): key is 'AND' | 'OR' | 'NOT' {
  return conditionalFilterOperators.has(key)
}

function isFieldFilter(value: unknown): value is FieldFilter {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

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

  if (filter.AND !== undefined && !filter.AND.every(filter => testFilter(filter, serialized))) {
    return false
  }
  if (filter.OR !== undefined && !filter.OR.some(filter => testFilter(filter, serialized))) {
    return false
  }
  if (filter.NOT !== undefined && testFilter(filter.NOT, serialized)) {
    return false
  }

  for (const [key, filterOnField] of Object.entries(filter)) {
    if (isConditionalFilterOperator(key) || !isFieldFilter(filterOnField)) continue
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

export function isPotentiallyVisibleAction(
  actionView: ActionMeta['listView'] | ActionMeta['itemView']
): boolean {
  return typeof actionView.actionMode !== 'string' || actionView.actionMode === 'enabled'
}

function getConditionalFilterFieldKeys(
  actionMode: ConditionalFilter<string, string, BaseListTypeInfo>
): string[] {
  if (typeof actionMode === 'string') return []

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

  for (const conditionalFilter of Object.values(actionMode)) {
    collectFieldKeys(conditionalFilter)
  }

  return [...fieldKeys]
}

export function getQueriedFieldKeysWithActions(
  columns: readonly string[],
  actions: readonly ActionMeta[],
  view: 'listView' | 'itemView'
): string[] {
  const fieldKeys = new Set(columns)

  for (const action of actions) {
    if (!isPotentiallyVisibleAction(action[view])) continue

    for (const fieldKey of action.graphql.fields) {
      fieldKeys.add(fieldKey)
    }

    for (const fieldKey of getConditionalFilterFieldKeys(action[view].actionMode)) {
      fieldKeys.add(fieldKey)
    }
  }

  return [...fieldKeys]
}
