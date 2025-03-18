import { type ReactNode, createContext, useContext, useMemo } from 'react'
import { createUploadLink } from 'apollo-upload-client'

import { ClientSideOnlyDocumentElement, KeystarProvider } from '@keystar/ui/core'
import { Toaster } from '@keystar/ui/toast'
import type { AdminMeta, FieldViews, KeystoneConfig } from '../types'
import type { QueryResult } from './apollo'
import { gql, ApolloProvider, ApolloClient, InMemoryCache, useQuery } from './apollo'
import { useRouter } from 'next/navigation'
import type { AdminMetaQuery } from './admin-meta-graphql'

type KeystoneContextType = {
  components: KeystoneConfig['ui']['components']
  adminMeta: AdminMeta | null
  apiPath: string | null
  basePath: string
}

const KeystoneContext = createContext<KeystoneContextType>({
  components: {},
  adminMeta: null,
  apiPath: null,
  basePath: '',
})

type KeystoneProviderProps = {
  config: {
    components: KeystoneConfig['ui']['components']
    apiPath: string
    basePath: string
    adminMeta: AdminMetaQuery
    fieldViews: Record<
      string,
      Record<string, { main: FieldViews; custom?: Partial<FieldViews> & Record<string, unknown> }>
    >
  }
  children: ReactNode
}

const expectedExports = new Set(['Field', 'controller'])

export function KeystoneProvider(props: KeystoneProviderProps) {
  const apolloClient = useMemo(
    () =>
      new ApolloClient({
        cache: new InMemoryCache(),
        uri: props.config.apiPath,
        link: createUploadLink({
          uri: props.config.apiPath,
          headers: { 'Apollo-Require-Preflight': 'true' },
        }),
      }),
    [props.config.apiPath]
  )
  const { push: navigate } = useRouter()
  const keystarRouter = useMemo(() => ({ navigate }), [navigate])
  const context = useMemo((): KeystoneContextType => {
    const adminMeta: AdminMeta = {
      lists: {},
    }
    for (const list of props.config.adminMeta.keystone.adminMeta.lists) {
      const listFieldViews = props.config.fieldViews[list.key]
      adminMeta.lists[list.key] = {
        ...list,
        groups: [],
        fields: {},
      }

      for (const field of list.fields) {
        const viewsModules = listFieldViews[field.path]
        for (const exportName of expectedExports) {
          if (viewsModules.main[exportName as 'controller' | 'Field'] === undefined) {
            throw new Error(
              `The view for the field at ${list.key}.${field.path} is missing the ${exportName} export`
            )
          }
        }

        const views = { ...viewsModules.main }
        const customViews: Record<string, any> = {}
        if (viewsModules.custom) {
          const allowedExportsOnCustomViews = new Set(views.allowedExportsOnCustomViews)
          for (const exportName in viewsModules.custom) {
            if (allowedExportsOnCustomViews.has(exportName)) {
              customViews[exportName] = viewsModules.custom[exportName]
            } else if (expectedExports.has(exportName)) {
              ;(views as any)[exportName] = viewsModules.custom[exportName]
            }
          }
        }

        adminMeta.lists[list.key].fields[field.path] = {
          ...field,
          createView: {
            fieldMode: field.createView?.fieldMode ?? null,
          },
          itemView: {
            fieldMode: field.itemView?.fieldMode ?? null,
            fieldPosition: field.itemView?.fieldPosition ?? null,
          },
          listView: {
            fieldMode: field.listView?.fieldMode ?? null,
          },
          graphql: {
            isNonNull: field.isNonNull,
          },
          views,
          controller: views.controller({
            listKey: list.key,
            fieldMeta: field.fieldMeta,
            label: field.label,
            description: field.description,
            path: field.path,
            customViews,
          }),
        }
      }

      for (const group of list.groups) {
        adminMeta.lists[list.key].groups.push({
          label: group.label,
          description: group.description,
          fields: group.fields.map(field => adminMeta.lists[list.key].fields[field.path]),
        })
      }
    }
    return {
      adminMeta,
      apiPath: props.config.apiPath,
      basePath: props.config.basePath,
      components: props.config.components,
    }
  }, [props.config])
  return (
    <ApolloProvider client={apolloClient}>
      <KeystarProvider router={keystarRouter}>
        <ClientSideOnlyDocumentElement bodyBackground="surface" />
        <KeystoneContext.Provider value={context}>{props.children}</KeystoneContext.Provider>
        <Toaster />
      </KeystarProvider>
    </ApolloProvider>
  )
}

export function useRawKeystone() {
  const value = useContext(KeystoneContext)
  if (!value) throw new Error('useRawKeystone must be called inside a KeystoneProvider component')
  return value
}

export function useKeystone() {
  return useContext(KeystoneContext)
}

export function useList(listKey: string) {
  const { adminMeta } = useKeystone()
  const { lists } = adminMeta ?? {}
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

// TODO useContext
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
            path: string
            itemView: {
              fieldMode: 'edit' | 'read' | 'hidden'
              fieldPosition: 'form' | 'sidebar'
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
        if (field.path === 'id') return true
        return field.itemView.fieldMode !== 'hidden'
      })
      .map(field => field.controller.graphqlSelection)
      .join('\n')

    return gql`
      query KsFetchItem ($id: ID!, $listKey: String!) {
        item: ${list.graphql.names.itemQueryName}(where: {id: $id}) {
          ${selectedFields}
        }
        keystone {
          adminMeta {
            list(key: $listKey) {
              fields {
                path
                itemView(id: $id) {
                  fieldMode
                  fieldPosition
                }
              }
            }
          }
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
