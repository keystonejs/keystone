'use client'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

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
    for (const [key, val] of searchParams.entries()) {
      const filter = possibleFilters[key]
      if (!filter) continue
      if (typeof val !== 'string') continue
      try {
        const value = JSON.parse(val)
        filters.push({ ...filter, value })
      } catch (err) {}
    }

    const where = filters.map(filter => {
      return list.fields[filter.field].controller.filter!.graphql({
        type: filter.type,
        value: filter.value,
      })
    })

    return { filters, where: { AND: where } }
  }, [searchParams, possibleFilters, list])
  return filters
}
