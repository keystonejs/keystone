import { useMemo } from 'react'
import { type ListMeta } from '../../../../types'
import { useSearchParams } from 'next/navigation'

export function useSort (list: ListMeta, orderableFields: Set<string>) {
  const searchParams = useSearchParams()

  // Create a query object that behaves like the old query object
  const query = {}
  for (let [key, value] of searchParams.entries()) {
    query[key] = value
  }
  let sortByFromUrl = typeof query.sortBy === 'string' ? query.sortBy : null

  return useMemo(() => {
    if (sortByFromUrl === '') return null
    if (sortByFromUrl === null) return list.initialSort

    if (sortByFromUrl.startsWith('-')) {
      const field = sortByFromUrl.slice(1)
      if (!orderableFields.has(field)) return null

      return {
        field,
        direction: 'DESC' as const
      }
    }

    if (!orderableFields.has(sortByFromUrl)) return null
    return {
      field: sortByFromUrl,
      direction: 'ASC' as const
    }
  }, [sortByFromUrl, list, orderableFields])
}
