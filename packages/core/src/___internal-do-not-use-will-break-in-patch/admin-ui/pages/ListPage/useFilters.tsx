import { useMemo } from 'react'
import { useSearchParams } from '../../../../admin-ui/navigation'

import type { JSONValue, ListMeta } from '../../../../types'

export type Filter = {
  field: string
  type: string
  value: JSONValue
}

export function useFilters(list: ListMeta) {
  const searchParams = useSearchParams()
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
    for (const [key, val] of searchParams) {
      const filter = possibleFilters[key]
      if (filter && typeof val === 'string') {
        let value
        try {
          value = JSON.parse(val)
        } catch (err) {}
        if (val !== undefined) {
          filters.push({ ...filter, value })
        }
      }
    }

    const where = filters.reduce((_where, filter) => {
      return Object.assign(
        _where,
        list.fields[filter.field].controller.filter!.graphql({
          type: filter.type,
          value: filter.value,
        })
      )
    }, {})
    if (list.isSingleton) return { filters, where: { id: { equals: 1 }, AND: [where] } }
    return { filters, where }
  }, [list, searchParams, possibleFilters])
  return filters
}
