import { useEffect, useMemo, useState } from 'react'
import isDeepEqual from 'fast-deep-equal'

import type { ListMeta, ListSortDescriptor } from '../../../../types'
import {
  type TypedDocumentNode,
  ApolloClient,
  gql,
  InMemoryCache,
  useApolloClient,
  useQuery,
} from '../../../../admin-ui/apollo'
import { useSearchFilter } from './useFilter'
import type { RelationshipValue } from './types'

function useDebouncedValue<T>(value: T, limitMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(() => value)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(() => value)
    }, limitMs)
    return () => clearTimeout(timeout)
  }, [value, limitMs])

  return debouncedValue
}

export function useApolloQuery(args: {
  labelField: string
  list: ListMeta
  searchFields: string[]
  sort?: ListSortDescriptor<string> | null
  filter?: Record<string, any> | null
  state:
    | { kind: 'many'; value: RelationshipValue[] }
    | { kind: 'one'; value: RelationshipValue | null }
}) {
  const { labelField, list, searchFields, state } = args
  const [search, setSearch] = useState(() => {
    if (state.kind === 'one' && state.value?.label) return state.value?.label
    return ''
  })

  const QUERY: TypedDocumentNode<
    { items: { id: string; label: string | null }[]; count: number },
    {
      where: Record<string, any>
      take: number
      skip: number
      orderBy: Record<string, any> | undefined
    }
  > = gql`
    query RelationshipSelect($where: ${list.graphql.names.whereInputName}!, $take: Int!, $skip: Int!, $orderBy: [${list.graphql.names.listOrderName}!]) {
      items: ${list.graphql.names.listQueryName}(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        id: id
        label: ${labelField}
      }
      count: ${list.graphql.names.listQueryCountName}(where: $where)
    }
  `

  const debouncedSearch = useDebouncedValue(search, 200)
  const manipulatedSearch =
    state.kind === 'one' && state.value?.label === debouncedSearch ? '' : debouncedSearch

  const searchFilter = useSearchFilter(manipulatedSearch, list, searchFields)
  const _where = {
    OR: searchFilter,
  }
  const where = args.filter ? { AND: [_where, args.filter] } : _where

  const orderBy = useMemo(() => {
    return args.sort ? { [args.sort.field]: args.sort.direction.toLowerCase() } : undefined
  }, [args.sort])

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
                  merge: (existing: readonly unknown[], incoming: readonly unknown[], { args }) => {
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
    variables: { where, take: initialItemsToLoad, skip: 0, orderBy },
    client: apolloClient,
  })

  // we want to avoid fetching more again and `loading` from Apollo
  // doesn't seem to become true when fetching more
  const [lastFetchMore, setLastFetchMore] = useState<{
    where: Record<string, any>
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
      (!isDeepEqual(lastFetchMore?.where, where) ||
        lastFetchMore?.list !== list ||
        lastFetchMore?.skip !== skip)
    ) {
      const QUERY: TypedDocumentNode<
        { items: { id: string; label: string | null }[] },
        {
          where: Record<string, any>
          take: number
          skip: number
          orderBy: Record<string, any> | undefined
        }
      > = gql`
        query RelationshipSelectMore($where: ${list.graphql.names.whereInputName}!, $take: Int!, $skip: Int!, $orderBy: [${list.graphql.names.listOrderName}!]) {
          items: ${list.graphql.names.listQueryName}(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
            id
            label: ${labelField}
          }
        }
      `
      setLastFetchMore({ list, skip, where })
      fetchMore({
        query: QUERY,
        variables: {
          where,
          take: subsequentItemsToLoad,
          skip,
          orderBy,
        },
      })
        .then(() => setLastFetchMore(null))
        .catch(() => setLastFetchMore(null))
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

function getLoadingState(options: { loading: boolean; search: string }): LoadingState {
  if (options.loading) {
    if (options.search.length) return 'filtering'
    return 'loading'
  }

  return 'idle'
}

type LoadingState = 'loading' | 'sorting' | 'loadingMore' | 'error' | 'idle' | 'filtering'
