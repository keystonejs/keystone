import UploadLink from 'apollo-upload-client/UploadHttpLink.mjs'
import { type ReactNode, createContext, useContext, useEffect, useMemo } from 'react'

import { ClientSideOnlyDocumentElement, KeystarProvider } from '@keystar/ui/core'
import { injectGlobal, tokenSchema } from '@keystar/ui/style'
import { Toaster } from '@keystar/ui/toast'

import { snapValueToClosest } from '../___internal-do-not-use-will-break-in-patch/admin-ui/pages/ListPage/PaginationControls.tsx'
import type {
  AdminConfig,
  BaseListTypeInfo,
  ConditionalFilter,
  ConditionalFilterCase,
  FieldViews,
  ListMeta,
} from '../types/index.ts'
import { type AdminMetaQuery, adminMetaQuery } from './admin-meta-graphql.ts'
import {
  ApolloClient,
  ApolloProvider,
  type ErrorLike,
  InMemoryCache,
  gql,
  useQuery,
} from './apollo.ts'
import { useRouter } from './router.tsx'
import {
  getConditionalFilterCaseFieldKeys,
  getConditionalFilterFieldKeys,
  isActionAvailable,
} from './utils/filters.ts'

type KeystoneContextType = {
  adminConfig: AdminConfig | null
  apiPath: string | null
  error?: ErrorLike | null
  fieldViews: FieldViews
  lists: { [list: string]: ListMeta }
}

const KeystoneContext = createContext<KeystoneContextType>({
  adminConfig: null,
  apiPath: null,
  lists: {},
  fieldViews: {},
})

type KeystoneProviderProps = {
  adminConfig: AdminConfig
  apiPath: string
  fieldViews: FieldViews
  children: ReactNode
}

const expectedExports = new Set(['Field', 'controller'])

function InternalKeystoneProvider({
  adminConfig,
  apiPath,
  fieldViews,
  children,
}: KeystoneProviderProps) {
  const { push: navigate } = useRouter()
  const keystarRouter = useMemo(() => ({ navigate }), [navigate])
  const { data, loading, error } = useQuery<AdminMetaQuery>(adminMetaQuery, {
    errorPolicy: 'all',
  })
  const listsData = data?.keystone?.adminMeta?.lists
  const lists = useMemo(() => {
    if (!listsData) return
    if (error) return

    const lists: KeystoneContextType['lists'] = {}

    for (const listData of listsData) {
      lists[listData.key] = {
        ...listData,
        pageSize: snapValueToClosest(listData.pageSize ?? 50),
        fields: {},
        groups: [],
      }

      function hydrateField(field: (typeof listData.fields)[number]) {
        for (const exportName of expectedExports) {
          if ((fieldViews[field.viewsIndex] as any)[exportName] === undefined) {
            throw new Error(
              `The view for the field at ${listData.key}.${field.key} is missing the ${exportName} export`
            )
          }
        }

        const views = { ...fieldViews[field.viewsIndex] }
        const customViews: Record<string, any> = {}
        if (field.customViewsIndex !== null) {
          const customViewsSource: FieldViews[number] & Record<string, any> =
            fieldViews[field.customViewsIndex]
          const allowedExportsOnCustomViews = new Set(views.allowedExportsOnCustomViews)
          for (const exportName in customViewsSource) {
            if (allowedExportsOnCustomViews.has(exportName)) {
              customViews[exportName] = customViewsSource[exportName]
            } else if (expectedExports.has(exportName)) {
              ;(views as any)[exportName] = customViewsSource[exportName]
            }
          }
        }

        return {
          ...field,
          createView: {
            fieldMode: field.createView?.fieldMode ?? 'edit',
            isRequired: field.createView?.isRequired ?? false,
          },
          itemView: {
            fieldMode: field.itemView?.fieldMode ?? null,
            fieldPosition: field.itemView?.fieldPosition ?? null,
            isRequired: field.itemView?.isRequired ?? false,
          },
          listView: {
            fieldMode: field.listView?.fieldMode ?? null,
          },
          views,
          controller: views.controller({
            listKey: listData.key,
            fieldKey: field.key,
            label: field.label,
            description: field.description,
            fieldMeta: field.fieldMeta,
            customViews,
          }),
        }
      }

      for (const field of listData.fields) {
        lists[listData.key].fields[field.key] = hydrateField(field)
      }

      for (const group of listData.groups) {
        lists[listData.key].groups.push({
          label: group.label,
          description: group.description,
          fields: group.fields.map(field => lists[listData.key].fields[field.key]),
        })
      }

      lists[listData.key].actions = listData.actions.map(action => ({
        ...action,
        graphql: {
          ...action.graphql,
          arguments: action.graphql.arguments.map(arg =>
            arg.source && 'field' in arg.source
              ? {
                  ...arg,
                  source: {
                    field: hydrateField(arg.source.field as (typeof listData.fields)[number]),
                  },
                }
              : arg
          ),
        },
      }))
    }

    return lists
  }, [listsData, error, fieldViews])

  // TODO: remove this once studio is fully migrated to keystar-ui
  useEffect(() => {
    injectGlobal({
      body: {
        fontFamily: tokenSchema.typography.fontFamily.base,
      },

      // [1] reset all box sizing to border-box
      // [2] default borders so you can add a border by specifying just the width
      '*, ::before, ::after': {
        // boxSizing: 'border-box', // this breaks some things in keystar-ui…
        borderWidth: 0,
        borderStyle: 'solid',
        borderColor: tokenSchema.color.border.neutral,
      },
    })
  }, [])

  // TODO
  if (loading) return null
  //   if (!meta) return null
  return (
    <KeystarProvider router={keystarRouter}>
      <ClientSideOnlyDocumentElement bodyBackground="surface" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <KeystoneContext.Provider
        value={{
          adminConfig,
          apiPath,
          fieldViews,
          lists: lists ?? {},
          error: error ?? null,
        }}
      >
        {children}
      </KeystoneContext.Provider>
      <Toaster />
    </KeystarProvider>
  )
}

export function KeystoneProvider(props: KeystoneProviderProps) {
  const apolloClient = useMemo(
    () =>
      new ApolloClient({
        cache: new InMemoryCache(),
        link: new UploadLink({
          uri: props.apiPath,
          headers: { 'Apollo-Require-Preflight': 'true' },
        }),
      }),
    [props.apiPath]
  )

  return (
    <ApolloProvider client={apolloClient}>
      <InternalKeystoneProvider {...props} />
    </ApolloProvider>
  )
}

export function useKeystone() {
  return useContext(KeystoneContext)
}

export function useList(listKey: string) {
  const { lists } = useKeystone()
  const list = lists?.[listKey]
  if (!list) throw new Error(`Unknown list ${listKey}`)
  return list
}

export function useField(listKey: string, fieldKey: string) {
  const list = useList(listKey)
  const field = list.fields[fieldKey]
  if (!field) throw new Error(`Unknown field ${listKey}.${fieldKey}`)
  return field
}

// TODO useContext?
export function useListItem(
  listKey: string,
  itemId: string | null
): useQuery.Result<
  {
    item: Record<string, unknown> | null
    keystone: {
      adminMeta: {
        list: {
          fields: {
            key: string
            itemView: {
              fieldMode: ConditionalFilter<
                'edit' | 'read' | 'hidden',
                'read' | 'hidden',
                BaseListTypeInfo
              >
              fieldPosition: 'form' | 'sidebar'
              isRequired: ConditionalFilterCase<BaseListTypeInfo>
            } | null
          }[]
          actions: {
            key: string
            itemView: {
              actionMode: ConditionalFilter<
                'enabled' | 'disabled' | 'hidden',
                'disabled' | 'hidden',
                BaseListTypeInfo
              >
            } | null
          }[]
        } | null
      }
    }
  },
  { id: string | null; listKey: string }
> {
  const list = useList(listKey)
  const query = useMemo(() => {
    const selectedFieldKeys = new Set<string>()

    for (const field of Object.values(list.fields)) {
      if (field.key === 'id') continue // always in the query
      for (const fieldKey of getConditionalFilterFieldKeys(field.itemView.fieldMode)) {
        selectedFieldKeys.add(fieldKey)
      }
      for (const fieldKey of getConditionalFilterCaseFieldKeys(field.itemView.isRequired)) {
        selectedFieldKeys.add(fieldKey)
      }
      if (field.itemView.fieldMode === 'hidden') continue
      selectedFieldKeys.add(field.key)
    }

    for (const action of list.actions) {
      if (!isActionAvailable(action, action.itemView)) continue

      for (const fieldKey of getConditionalFilterFieldKeys(action.itemView.actionMode)) {
        selectedFieldKeys.add(fieldKey)
      }

      for (const arg of action.graphql.arguments) {
        const itemField = arg.source && 'itemField' in arg.source ? arg.source.itemField : undefined
        if (!itemField) continue
        selectedFieldKeys.add(itemField)
      }
    }

    const selectedFields = [...selectedFieldKeys]
      .map(fieldKey => list.fields[fieldKey])
      .filter(Boolean)
      .map(field => field.controller.graphqlSelection)
      .join('\n')

    return gql`
      query KsFetchItem ($listKey: String!, $id: ID!) {
        keystone {
          adminMeta {
            list(key: $listKey, itemId: $id) {
              fields {
                key
                itemView {
                  fieldMode
                  fieldPosition
                  isRequired
                }
              }
              actions {
                key
                itemView {
                  actionMode
                }
              }
            }
          }
        }
        item: ${list.graphql.names.itemQueryName}(where: { id: $id }) {
          id
          ${selectedFields}
        }
      }
    `
  }, [list])

  return useQuery(query, {
    errorPolicy: 'all',
    skip: itemId === null,
    variables: {
      listKey,
      id: itemId,
    },
  })
}
