import type { GraphQLError } from 'graphql'
import { useMemo } from 'react'
import type { VisibleLists, CreateViewFieldModes } from '../../types'
import { type DocumentNode, useQuery, type QueryResult, type ServerError, type ServerParseError } from '../apollo'
import { type DeepNullable, makeDataGetter } from './dataGetter'

export type { VisibleLists, CreateViewFieldModes }

export function useLazyMetadata (query: DocumentNode): {
  refetch: () => Promise<void>
  visibleLists: VisibleLists
  createViewFieldModes: CreateViewFieldModes
} {
  const result = useQuery(query, { errorPolicy: 'all', fetchPolicy: 'no-cache' })
  return useMemo(() => {
    const refetch = async () => {
      await result.refetch()
    }

    const dataGetter = makeDataGetter<
      DeepNullable<{
        keystone: {
          adminMeta: {
            lists: {
              key: string
              fields: { path: string, createView: { fieldMode: 'edit' | 'hidden' } }[]
            }[]
          }
        }
      }>
    >(result.data, result.error?.graphQLErrors)
    const keystoneMetaGetter = dataGetter.get('keystone')

    return {
      refetch,
      visibleLists: getVisibleLists(
        result,
        keystoneMetaGetter.errors || (result.error?.networkError ?? undefined)
      ),
      createViewFieldModes: getCreateViewFieldModes(
        result,
        keystoneMetaGetter.errors || (result.error?.networkError ?? undefined)
      ),
    }
  }, [result])
}

function getCreateViewFieldModes (
  { data }: QueryResult,
  error?: Error | ServerParseError | ServerError | readonly [GraphQLError, ...GraphQLError[]]
): CreateViewFieldModes {
  if (error) {
    return { state: 'error', error }
  }
  if (data) {
    const lists: Record<string, Record<string, 'edit' | 'hidden'>> = {}
    data.keystone.adminMeta.lists.forEach((list: any) => {
      lists[list.key] = {}
      list.fields.forEach((field: any) => {
        lists[list.key][field.path] = field.createView.fieldMode
      })
    })
    return { state: 'loaded', lists }
  }

  return { state: 'loading' }
}

function getVisibleLists (
  { data }: QueryResult,
  error?: Error | ServerParseError | ServerError | readonly [GraphQLError, ...GraphQLError[]]
): VisibleLists {
  if (error) return { state: 'error', error }
  if (data) {
    const lists = new Set<string>()
    data.keystone.adminMeta.lists.forEach((list: any) => {
      if (!list.hideNavigation) lists.add(list.key)
    })
    return { state: 'loaded', lists }
  }

  return { state: 'loading' }
}
