import { useRouter } from 'next/router'

import type { ListMeta } from '../../../../types'

export function useSort (list: ListMeta) {
  const { query } = useRouter()
  const sortByFromUrl = typeof query.sortBy === 'string' ? query.sortBy : null
  if (!sortByFromUrl) return null
  const fieldKey = sortByFromUrl.startsWith('-') ? sortByFromUrl.slice(1) : sortByFromUrl
  const direction = sortByFromUrl.startsWith('-') ? 'DESC' as const : 'ASC' as const
  const field = list.fields[fieldKey]
  if (!field) return null
  if (!field.isOrderable) return null
  if (sortByFromUrl === '') return null
  if (sortByFromUrl === null) return list.initialSort
  return {
    field: fieldKey,
    direction
  }
}
