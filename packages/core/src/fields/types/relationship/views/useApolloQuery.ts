import { useMemo, useState } from 'react'

import { useKeystone } from '@keystone-6/core/admin-ui/context'
import { type ListMeta } from '../../../../types'
import {
  type TypedDocumentNode,
  ApolloClient,
  gql,
  InMemoryCache,
  useApolloClient,
  useQuery,
} from '../../../../admin-ui/apollo'
import { useDebouncedValue } from './utils'
import { useSearchFilter } from './useFilter'
import { RelationshipValue } from './types'

export function useApolloQuery (args: {
  extraSelection: string
  labelField: string
  list: ListMeta
  searchFields: string[]
  state:
    | { kind: 'many', value: RelationshipValue[] }
    | { kind: 'one', value: RelationshipValue | null }
}) {
  const keystone = useKeystone()
  const { extraSelection, labelField, list, searchFields, state } = args
  const [search, setSearch] = useState(() => {
    if (state.kind === 'one' && state.value?.label) return state.value?.label
    return ''
  })

  const QUERY: TypedDocumentNode<
    { items: { id: string; label: string | null }[]; count: number },
    { where: Record<string, any>; take: number; skip: number }
  > = gql`
    query RelationshipSelect($where: ${list.graphql.names.whereInputName}!, $take: Int!, $skip: Int!) {
      items: ${list.graphql.names.listQueryName}(where: $where, take: $take, skip: $skip) {
        id: id
        label: ${labelField}
        ${extraSelection}
      }
      count: ${list.graphql.names.listQueryCountName}(where: $where)
    }
  `

  const debouncedSearch = useDebouncedValue(search, 200)
  const manipulatedSearch =
    state.kind === 'one' && state.value?.label === debouncedSearch
      ? ''
      : debouncedSearch
  const where = useSearchFilter(manipulatedSearch, list, searchFields, keystone.adminMeta.lists)

  const link = useApolloClient().link
  // we're using a local apollo client here because writing a global implementation of the typePolicies
  // would require making assumptions about how pagination should work which won't always be right
  const apolloClient = useMemo(
    () =>
      new ApolloClient({
        link,
        cache: new InMemoryCache({
          typePolicies: {
            Query: {
              fields: {
                [list.graphql.names.listQueryName]: {
                  keyArgs: ['where'],
                  merge: (
                    existing: readonly unknown[],
                    incoming: readonly unknown[],
                    { args }
                  ) => {
                    const merged = existing ? existing.slice() : []
                    const { skip } = args!
                    for (let i = 0; i < incoming.length; ++i) {
                      merged[skip + i] = incoming[i]
                    }
                    return merged
                  },
                },
              },
            },
          },
        }),
      }),
    [link, list.graphql.names.listQueryName]
  )

  const initialItemsToLoad = Math.min(list.pageSize, 10)
  const subsequentItemsToLoad = Math.min(list.pageSize, 50)
  const { data, previousData, error, loading, fetchMore } = useQuery(QUERY, {
    fetchPolicy: 'network-only',
    variables: { where, take: initialItemsToLoad, skip: 0 },
    client: apolloClient,
  })

  // we want to avoid fetching more again and `loading` from Apollo
  // doesn't seem to become true when fetching more
  const [lastFetchMore, setLastFetchMore] = useState<{
    where: Record<string, any>
    extraSelection: string
    list: ListMeta
    skip: number
  } | null>(null)

  const count = data?.count || 0
  const onLoadMore = () => {
    const skip = data?.items.length
    if (
      !loading &&
      skip &&
      data.items.length < count &&
      (lastFetchMore?.extraSelection !== extraSelection ||
        lastFetchMore?.where !== where ||
        lastFetchMore?.list !== list ||
        lastFetchMore?.skip !== skip)
    ) {
      const QUERY: TypedDocumentNode<
        { items: { id: string; label: string | null }[] },
        { where: Record<string, any>; take: number; skip: number }
      > = gql`
        query RelationshipSelectMore($where: ${list.graphql.names.whereInputName}!, $take: Int!, $skip: Int!) {
          items: ${list.graphql.names.listQueryName}(where: $where, take: $take, skip: $skip) {
            label: ${labelField}
            id: id
            ${extraSelection}
          }
        }
      `
      setLastFetchMore({ extraSelection, list, skip, where })
      fetchMore({
        query: QUERY,
        variables: {
          where,
          take: subsequentItemsToLoad,
          skip,
        },
      })
        .then(() => {
          setLastFetchMore(null)
        })
        .catch(() => {
          setLastFetchMore(null)
        })
    }
  }

  return {
    data: loading ? previousData : data,
    error,
    loading,
    loadingState: getLoadingState({ loading, search }),
    search,
    setSearch,
    onLoadMore,
  }
}

function getLoadingState(options: {
  loading: boolean
  search: string
}): LoadingState {
  if (options.loading) {
    if (options.search.length) return 'filtering'
    return 'loading'
  }

  return 'idle'
}

type LoadingState =
  | 'loading'
  | 'sorting'
  | 'loadingMore'
  | 'error'
  | 'idle'
  | 'filtering'
