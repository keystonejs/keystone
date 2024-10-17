/** @jsxRuntime classic */
/** @jsx jsx */

import 'intersection-observer'
import {
  type RefObject,
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext,
  useRef
} from 'react'

import { jsx } from '@keystone-ui/core'
import { MultiSelect, Select, selectComponents } from '@keystone-ui/fields'
import { type ListMeta } from '../../../../types'
import {
  type TypedDocumentNode,
  ApolloClient,
  gql,
  InMemoryCache,
  useApolloClient,
  useQuery,
} from '../../../../admin-ui/apollo'

function useIntersectionObserver (cb: IntersectionObserverCallback, ref: RefObject<any>) {
  const cbRef = useRef(cb)
  useEffect(() => {
    cbRef.current = cb
  })
  useEffect(() => {
    const observer = new IntersectionObserver((...args) => cbRef.current(...args), {})
    const node = ref.current
    if (node !== null) {
      observer.observe(node)
      return () => observer.unobserve(node)
    }
  }, [ref])
}

function useDebouncedValue<T> (value: T, limitMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(() => value)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(() => value)
    }, limitMs)
    return () => clearTimeout(timeout)
  }, [value, limitMs])

  return debouncedValue
}

function isInt (x: string) {
  return Number.isInteger(Number(x))
}

function isBigInt (x: string) {
  try {
    BigInt(x)
    return true
  } catch {
    return true
  }
}

// TODO: this is unfortunate, remove in breaking change?
function isUuid (x: unknown) {
  if (typeof x !== 'string') return
  if (x.length !== 36) return
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x)
}

export function useFilter (value: string, list: ListMeta, searchFields: string[]) {
  return useMemo(() => {
    const trimmedSearch = value.trim()
    if (!trimmedSearch.length) return { OR: [] }

    const conditions: Record<string, any>[] = []
    const idField = list.fields.id.fieldMeta as { type: string, kind: string }
    console.error({ idField, value, meta: list.fields.id.fieldMeta })

    if (idField.type === 'String') {
      // TODO: remove in breaking change?
      if (idField.kind === 'uuid') {
        if (isUuid(value)) {
          conditions.push({ id: { equals: trimmedSearch } })
        }
      } else {
        conditions.push({ id: { equals: trimmedSearch } })
      }
    } else if (idField.type === 'Int' && isInt(trimmedSearch)) {
      conditions.push({ id: { equals: Number(trimmedSearch) } })

    } else if (idField.type === 'BigInt' && isBigInt(trimmedSearch)) {
      conditions.push({ id: { equals: trimmedSearch } })
    }

    for (const fieldKey of searchFields) {
      const field = list.fields[fieldKey]
      conditions.push({
        [field.path]: {
          contains: trimmedSearch,
          mode: field.search === 'insensitive' ? 'insensitive' : undefined,
        },
      })
    }

    return { OR: conditions }
  }, [value, list, searchFields])
}

const idFieldAlias = '____id____'
const labelFieldAlias = '____label____'

const LoadingIndicatorContext = createContext<{
  count: number
  ref:(element: HTMLElement | null) => void
}>({
  count: 0,
  ref: () => {},
})

export const RelationshipSelect = ({
  autoFocus,
  controlShouldRenderValue,
  isDisabled,
  isLoading,
  labelField,
  searchFields,
  list,
  placeholder,
  portalMenu,
  state,
  extraSelection = '',
}: {
  autoFocus?: boolean
  controlShouldRenderValue: boolean
  isDisabled: boolean
  isLoading?: boolean
  labelField: string
  searchFields: string[]
  list: ListMeta
  placeholder?: string
  portalMenu?: true | undefined
  state:
    | {
        kind: 'many'
        value: { label: string, id: string, data?: Record<string, any> }[]
        onChange(value: { label: string, id: string, data: Record<string, any> }[]): void
      }
    | {
        kind: 'one'
        value: { label: string, id: string, data?: Record<string, any> } | null
        onChange(value: { label: string, id: string, data: Record<string, any> } | null): void
      }
  extraSelection?: string
}) => {
  const [search, setSearch] = useState('')
  // note it's important that this is in state rather than a ref
  // because we want a re-render if the element changes
  // so that we can register the intersection observer
  // on the right element
  const [loadingIndicatorElement, setLoadingIndicatorElement] = useState<null | HTMLElement>(null)

  const QUERY: TypedDocumentNode<
    { items: { [idFieldAlias]: string, [labelFieldAlias]: string | null }[], count: number },
    { where: Record<string, any>, take: number, skip: number }
  > = gql`
    query RelationshipSelect($where: ${list.gqlNames.whereInputName}!, $take: Int!, $skip: Int!) {
      items: ${list.gqlNames.listQueryName}(where: $where, take: $take, skip: $skip) {
        ${idFieldAlias}: id
        ${labelFieldAlias}: ${labelField}
        ${extraSelection}
      }
      count: ${list.gqlNames.listQueryCountName}(where: $where)
    }
  `

  const debouncedSearch = useDebouncedValue(search, 200)
  const where = useFilter(debouncedSearch, list, searchFields)

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
                [list.gqlNames.listQueryName]: {
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
    [link, list.gqlNames.listQueryName]
  )

  const initialItemsToLoad = Math.min(list.pageSize, 10)
  const subsequentItemsToLoad = Math.min(list.pageSize, 50)
  const { data, error, loading, fetchMore } = useQuery(QUERY, {
    fetchPolicy: 'network-only',
    variables: { where, take: initialItemsToLoad, skip: 0 },
    client: apolloClient,
  })

  const count = data?.count || 0

  const options =
    data?.items?.map(({ [idFieldAlias]: value, [labelFieldAlias]: label, ...data }) => ({
      value,
      label: label || value,
      data,
    })) || []

  const loadingIndicatorContextVal = useMemo(
    () => ({
      count,
      ref: setLoadingIndicatorElement,
    }),
    [count]
  )

  // we want to avoid fetching more again and `loading` from Apollo
  // doesn't seem to become true when fetching more
  const [lastFetchMore, setLastFetchMore] = useState<{
    where: Record<string, any>
    extraSelection: string
    list: ListMeta
    skip: number
  } | null>(null)

  useIntersectionObserver(
    ([{ isIntersecting }]) => {
      const skip = data?.items.length
      if (
        !loading &&
        skip &&
        isIntersecting &&
        options.length < count &&
        (lastFetchMore?.extraSelection !== extraSelection ||
          lastFetchMore?.where !== where ||
          lastFetchMore?.list !== list ||
          lastFetchMore?.skip !== skip)
      ) {
        const QUERY: TypedDocumentNode<
          { items: { [idFieldAlias]: string, [labelFieldAlias]: string | null }[] },
          { where: Record<string, any>, take: number, skip: number }
        > = gql`
              query RelationshipSelectMore($where: ${list.gqlNames.whereInputName}!, $take: Int!, $skip: Int!) {
                items: ${list.gqlNames.listQueryName}(where: $where, take: $take, skip: $skip) {
                  ${labelFieldAlias}: ${labelField}
                  ${idFieldAlias}: id
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
    },
    { current: loadingIndicatorElement }
  )

  // TODO: better error UI
  // TODO: Handle permission errors
  // (ie; user has permission to read this relationship field, but
  // not the related list, or some items on the list)
  if (error) {
    return <span>Error</span>
  }

  if (state.kind === 'one') {
    return (
      <LoadingIndicatorContext.Provider value={loadingIndicatorContextVal}>
        <Select
          // this is necessary because react-select passes a second argument to onInputChange
          // and useState setters log a warning if a second argument is passed
          onInputChange={val => setSearch(val)}
          isLoading={loading || isLoading}
          autoFocus={autoFocus}
          components={relationshipSelectComponents}
          portalMenu={portalMenu}
          value={
            state.value
              ? {
                  value: state.value.id,
                  label: state.value.label,
                  // @ts-expect-error
                  data: state.value.data,
                }
              : null
          }
          options={options}
          onChange={value => {
            state.onChange(
              value
                ? {
                    id: value.value,
                    label: value.label,
                    data: (value as any).data,
                  }
                : null
            )
          }}
          placeholder={placeholder}
          controlShouldRenderValue={controlShouldRenderValue}
          isClearable={controlShouldRenderValue}
          isDisabled={isDisabled}
        />
      </LoadingIndicatorContext.Provider>
    )
  }

  return (
    <LoadingIndicatorContext.Provider value={loadingIndicatorContextVal}>
      <MultiSelect // this is necessary because react-select passes a second argument to onInputChange
        // and useState setters log a warning if a second argument is passed
        onInputChange={val => setSearch(val)}
        isLoading={loading || isLoading}
        autoFocus={autoFocus}
        components={relationshipSelectComponents}
        portalMenu={portalMenu}
        value={state.value.map(value => ({
          value: value.id,
          label: value.label,
          data: value.data,
        }))}
        options={options}
        onChange={value => {
          state.onChange(value.map(x => ({ id: x.value, label: x.label, data: (x as any).data })))
        }}
        placeholder={placeholder}
        controlShouldRenderValue={controlShouldRenderValue}
        isClearable={controlShouldRenderValue}
        isDisabled={isDisabled}
      />
    </LoadingIndicatorContext.Provider>
  )
}

const relationshipSelectComponents: Partial<typeof selectComponents> = {
  MenuList: ({ children, ...props }) => {
    const { count, ref } = useContext(LoadingIndicatorContext)
    return (
      <selectComponents.MenuList {...props}>
        {children}
        <div css={{ textAlign: 'center' }} ref={ref}>
          {props.options.length < count && <span css={{ padding: 8 }}>Loading...</span>}
        </div>
      </selectComponents.MenuList>
    )
  },
}
