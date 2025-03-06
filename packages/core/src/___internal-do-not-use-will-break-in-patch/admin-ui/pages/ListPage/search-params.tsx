import type { JSONValue, ListMeta } from '../../../../types'
import { weakMemoize } from '../../../../lib/core/utils'
import type { SortDescriptor } from '@keystar/ui/table'

export type Filter = {
  field: string
  type: string
  value: JSONValue
}

const getPossibleFilters = weakMemoize((list: ListMeta) => {
  const possibleFilters: Record<string, { type: string; field: string }> = {}

  for (const [fieldPath, field] of Object.entries(list.fields)) {
    if (field.isFilterable && field.controller.filter) {
      for (const filterType in field.controller.filter.types) {
        possibleFilters[`!${fieldPath}_${filterType}`] = {
          type: filterType,
          field: fieldPath,
        }
      }
    }
  }
  return possibleFilters
})

export function parseFilters(list: ListMeta, query: Record<string, undefined | string | string[]>) {
  const possibleFilters = getPossibleFilters(list)
  const filters: Filter[] = []
  for (const [key, val] of Object.entries(query)) {
    const filter = possibleFilters[key]
    if (filter && typeof val === 'string') {
      let value
      try {
        value = JSON.parse(val)
      } catch (err) {}
      if (value !== undefined) {
        filters.push({ ...filter, value })
      }
    }
  }

  const where = filters.map(filter =>
    list.fields[filter.field].controller.filter!.graphql({
      type: filter.type,
      value: filter.value,
    })
  )
  if (list.isSingleton) return { filters, where: { id: { equals: 1 }, AND: where } }
  return { filters, where: { AND: where } }
}

export function parseSelectedFields(
  list: ListMeta,
  _fields: string | string[] | undefined
): ReadonlySet<string> {
  const selectedFieldsFromUrl = typeof _fields === 'string' ? _fields : ''

  const selectedFieldsArray = selectedFieldsFromUrl
    ? selectedFieldsFromUrl.split(',')
    : list.initialColumns
  const fields = selectedFieldsArray.filter(fieldKey => {
    const field = list.fields[fieldKey]
    if (!field) return false
    return field.listView.fieldMode === 'read'
  })

  return new Set(fields.length === 0 ? [list.labelField] : fields)
}

function initialListSort(list: ListMeta): SortDescriptor | undefined {
  const defaultSort = list.initialSort
  if (!defaultSort) return undefined
  return {
    column: defaultSort.field,
    direction: defaultSort.direction === 'ASC' ? 'ascending' : 'descending',
  }
}

export function parseSortBy(
  list: ListMeta,
  sortByFromUrl: string | string[] | undefined
): SortDescriptor | undefined {
  if (typeof sortByFromUrl !== 'string' || sortByFromUrl === '') return initialListSort(list)
  const fieldKey = sortByFromUrl.startsWith('-') ? sortByFromUrl.slice(1) : sortByFromUrl
  const direction = sortByFromUrl.startsWith('-') ? ('descending' as const) : ('ascending' as const)
  const field = list.fields[fieldKey]
  if (!field?.isOrderable) return initialListSort(list)
  return { column: fieldKey, direction: direction }
}
