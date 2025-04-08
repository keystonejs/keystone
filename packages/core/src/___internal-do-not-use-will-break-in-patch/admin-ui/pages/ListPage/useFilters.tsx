import { useMemo } from 'react'

import type { JSONValue, ListMeta } from '../../../../types'
import { useRouter } from '../../../../admin-ui/router'

export type Filter = {
  field: string
  type: string
  value: JSONValue
}

export function useFilters(list: ListMeta) {
  const { query } = useRouter()
  const possibleFilters = useMemo(() => {
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
  }, [list])
  const filters = useMemo(() => {
    const filters: Filter[] = []
    for (const key in query) {
      const filter = possibleFilters[key]
      if (!filter) continue
      const val = query[key]
      if (typeof val !== 'string') continue
      try {
        const value = JSON.parse(val)
        filters.push({ ...filter, value })
      } catch (err) {}
    }

    const where = filters.reduce<{ AND: Array<Record<string, string>> }>(
      (acc, filter) => {
        acc.AND.push(
          list.fields[filter.field].controller.filter!.graphql({
            type: filter.type,
            value: filter.value,
          })
        )
        return acc
      },
      { AND: [] }
    )

    return { filters, where }
  }, [query, possibleFilters, list])
  return filters
}
