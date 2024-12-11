import { useMemo } from 'react'
import type { VisibleLists, CreateViewFieldModes } from '../../types'
import {
  type DocumentNode,
  type QueryResult,
  useQuery,
} from '../apollo'

export type { VisibleLists, CreateViewFieldModes }

export function useLazyMetadata (query: DocumentNode): {
  refetch: () => Promise<void>
  visibleLists: VisibleLists
  createViewFieldModes: CreateViewFieldModes
} {
  const result = useQuery(query, { errorPolicy: 'all', fetchPolicy: 'no-cache' })
  const error = result.error?.networkError
  return useMemo(() => {
    const refetch = async () => { await result.refetch() }
    return {
      refetch,
      visibleLists: error ? { state: 'error', error } : getVisibleLists(result),
      createViewFieldModes: error ? { state: 'error', error } : getCreateViewFieldModes(result),
    }
  }, [result, error])
}

function getCreateViewFieldModes ({ data }: QueryResult): CreateViewFieldModes {
  if (!data) return { state: 'loading' }
  const lists: Record<string, Record<string, 'edit' | 'hidden'>> = {}
  for (const list of data.keystone.adminMeta.lists) {
    lists[list.key] = {}
    for (const field of list.fields) {
      lists[list.key][field.path] = field.createView.fieldMode
    }
  }
  return { state: 'loaded', lists }
}

function getVisibleLists ({ data }: QueryResult): VisibleLists {
  if (!data) return { state: 'loading' }
  const lists = new Set<string>()
  for (const list of data.keystone.adminMeta.lists) {
    if (!list.hideNavigation) lists.add(list.key)
  }
  return { state: 'loaded', lists }
}
