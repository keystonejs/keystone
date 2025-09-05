import { createUploadLink } from 'apollo-upload-client'
import NextHead from 'next/head'
import { type ReactNode, createContext, useContext, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { ClientSideOnlyDocumentElement, KeystarProvider } from '@keystar/ui/core'
import { injectGlobal, tokenSchema } from '@keystar/ui/style'
import { Toaster } from '@keystar/ui/toast'

import { snapValueToClosest } from '../___internal-do-not-use-will-break-in-patch/admin-ui/pages/ListPage/PaginationControls'
import type {
  AdminConfig,
  BaseListTypeInfo,
  ConditionalFilter,
  ConditionalFilterCase,
  FieldViews,
  ListMeta,
} from '../types'
import { type AdminMetaQuery, adminMetaQuery } from './admin-meta-graphql'
import type { ApolloError, QueryResult } from './apollo'
import { ApolloClient, ApolloProvider, InMemoryCache, gql, useQuery } from './apollo'

type KeystoneContextType = {
  adminConfig: AdminConfig | null
  apiPath: string | null
  error?: ApolloError | null
  fieldViews: FieldViews
  lists: { [list: string]: ListMeta }
  adminPath: string
  listsKeyByPath: Record<string, string>
}

const KeystoneContext = createContext<KeystoneContextType>({
  adminConfig: null,
  apiPath: null,
  lists: {},
  fieldViews: {},
  adminPath: '',
  listsKeyByPath: {},
})

type KeystoneProviderProps = {
  adminConfig: AdminConfig
  apiPath: string
  adminPath: string
  fieldViews: FieldViews
  children: ReactNode
}

const expectedExports = new Set(['Field', 'controller'])

function InternalKeystoneProvider({
  adminConfig,
  apiPath,
  fieldViews,
  children,
  adminPath,
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

      for (const field of listData.fields) {
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

        lists[listData.key].fields[field.key] = {
          ...field,
          createView: {
            fieldMode: field.createView?.fieldMode ?? null,
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

      for (const group of listData.groups) {
        lists[listData.key].groups.push({
          label: group.label,
          description: group.description,
          fields: group.fields.map(field => lists[listData.key].fields[field.key]),
        })
      }
    }

    return lists
  }, [listsData, error, fieldViews])
  const listsKeyByPath = useMemo(() => {
    if (!lists) return {}
    return Object.values(lists).reduce(
      (acc, list) => {
        acc[list.path] = list.key
        return acc
      },
      {} as Record<string, string>
    )
  }, [lists])

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
      <NextHead>
        <meta key="viewport" name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </NextHead>

      <KeystoneContext.Provider
        value={{
          adminConfig,
          apiPath,
          fieldViews,
          lists: lists ?? {},
          error: error ?? null,
          adminPath,
          listsKeyByPath,
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
        uri: props.apiPath,
        link: createUploadLink({
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
): QueryResult<
  {
    item: Record<string, unknown> | null
    keystone: {
      adminMeta: {
        list: {
          fields: {
            key: string
            itemView: {
              fieldMode: ConditionalFilter<'edit' | 'read' | 'hidden', BaseListTypeInfo>
              fieldPosition: 'form' | 'sidebar'
              isRequired: ConditionalFilterCase<BaseListTypeInfo>
            } | null
          }[]
          actions: {
            key: string
            itemView: {
              actionMode: ConditionalFilter<'enabled' | 'disabled' | 'hidden', BaseListTypeInfo>
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
    const selectedFields = Object.values(list.fields)
      .filter(field => {
        if (field.key === 'id') return true
        return field.itemView.fieldMode !== 'hidden'
      })
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
                itemView {
                  actionMode
                }
              }
            }
          }
        }
        item: ${list.graphql.names.itemQueryName}(where: { id: $id }) {
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
