import { useMemo } from 'react'
import { type JSONValue, type ListMeta } from '../../../../types'
import { useRouter } from '../../../../admin-ui/router'

export type Filter = { field: string, type: string, value: JSONValue }

export function useFilters (list: ListMeta, filterableFields: Set<string>) {
  const { query } = useRouter()
  const possibleFilters = useMemo(() => {
    const possibleFilters: Record<string, { type: string, field: string }> = {}
    Object.entries(list.fields).forEach(([fieldPath, field]) => {
      if (field.controller.filter && filterableFields.has(fieldPath)) {
        Object.keys(field.controller.filter.types).forEach(type => {
          possibleFilters[`!${fieldPath}_${type}`] = { type, field: fieldPath }
        })
      }
    })
    return possibleFilters
  }, [list, filterableFields])
  const filters = useMemo(() => {
    const filters: Filter[] = []
    Object.keys(query).forEach(key => {
      const filter = possibleFilters[key]
      const val = query[key]
      if (filter && typeof val === 'string') {
        let value
        try {
          value = JSON.parse(val)
        } catch (err) {}
        if (val !== undefined) {
          filters.push({ ...filter, value })
        }
      }
    })

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
  }, [query, possibleFilters, list])
  return filters
}
