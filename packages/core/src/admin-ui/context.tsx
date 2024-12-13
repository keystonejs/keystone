import React, {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo
} from 'react'
import NextHead from 'next/head'
import { createUploadLink } from 'apollo-upload-client'

import {
  ClientSideOnlyDocumentElement,
  KeystarProvider,
} from '@keystar/ui/core'
import { Toaster } from '@keystar/ui/toast'
import {
  injectGlobal,
  tokenSchema
} from '@keystar/ui/style'

import { Center } from '@keystone-ui/core'
import { LoadingDots } from '@keystone-ui/loading'
import { useRouter } from '@keystone-6/core/admin-ui/router'
import { DrawerProvider } from '@keystone-ui/modals'
import { ToastProvider } from '@keystone-ui/toast'

import type {
  AdminConfig,
  AdminMeta,
  FieldViews
} from '../types'
import {
  type AdminMetaQuery,
  adminMetaQuery
} from './admin-meta-graphql'
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  useQuery
} from './apollo'

type KeystoneContextType = {
  adminConfig: AdminConfig | null
  adminMeta: AdminMeta | null
  apiPath: string | null
  fieldViews: FieldViews
}

const KeystoneContext = createContext<KeystoneContextType>({
  adminConfig: null,
  adminMeta: null,
  apiPath: null,
  fieldViews: {},
})

type KeystoneProviderProps = {
  adminConfig: AdminConfig
  apiPath: string
  fieldViews: FieldViews
  children: ReactNode
}

const expectedExports = new Set(['Field', 'controller'])

function InternalKeystoneProvider ({
  adminConfig,
  apiPath,
  fieldViews,
  children,
}: KeystoneProviderProps) {
  const { push: navigate } = useRouter()
  const keystarRouter = useMemo(() => ({ navigate }), [navigate])
  const { data, loading, error } = useQuery<AdminMetaQuery>(adminMetaQuery)
  const lists = data?.keystone?.adminMeta?.lists
  const meta = useMemo(() => {
    if (!lists) return
    if (error) return

    const result: AdminMeta = {
      lists: {},
    }

    for (const list of lists) {
      result.lists[list.key] = {
        ...list,
        groups: [],
        fields: {},
      }

      for (const field of list.fields) {
        for (const exportName of expectedExports) {
          if ((fieldViews[field.viewsIndex] as any)[exportName] === undefined) {
            throw new Error(`The view for the field at ${list.key}.${field.path} is missing the ${exportName} export`)
          }
        }

        const views = { ...fieldViews[field.viewsIndex] }
        const customViews: Record<string, any> = {}
        if (field.customViewsIndex !== null) {
          const customViewsSource: FieldViews[number] & Record<string, any> = fieldViews[field.customViewsIndex]
          const allowedExportsOnCustomViews = new Set(views.allowedExportsOnCustomViews)
          for (const exportName in customViewsSource) {
            if (allowedExportsOnCustomViews.has(exportName)) {
              customViews[exportName] = customViewsSource[exportName]
            } else if (expectedExports.has(exportName)) {
              (views as any)[exportName] = customViewsSource[exportName]
            }
          }
        }

        result.lists[list.key].fields[field.path] = {
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
        result.lists[list.key].groups.push({
          label: group.label,
          description: group.description,
          fields: group.fields.map(field => result.lists[list.key].fields[field.path]),
        })
      }
    }

    return result
  }, [lists, error, fieldViews])

  // TODO: remove this once studio is fully migrated to keystar-ui
  useEffect(() => {
    injectGlobal({
      body: {
        fontFamily: tokenSchema.typography.fontFamily.base
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

  if (loading) {
    return (<Center fillView>
      <LoadingDots label='Loading Admin Metadata' size='large' />
    </Center>)
  }

  return (
    <KeystarProvider router={keystarRouter}>
      <ClientSideOnlyDocumentElement bodyBackground='surface' />
      <NextHead>
        <meta
          key='viewport'
          name='viewport'
          content='width=device-width, initial-scale=1.0'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
          rel='stylesheet'
        />
      </NextHead>

      <ToastProvider>
        <DrawerProvider>
          <KeystoneContext.Provider value={{
            adminConfig,
            adminMeta: meta ?? null,
            fieldViews,
            apiPath,
          }}>
            {children}
          </KeystoneContext.Provider>
        </DrawerProvider>
      </ToastProvider>
      <Toaster />
    </KeystarProvider>
  )
}

export function KeystoneProvider (props: KeystoneProviderProps) {
  const apolloClient = useMemo(() => new ApolloClient({
    cache: new InMemoryCache(),
    uri: props.apiPath,
    link: createUploadLink({
      uri: props.apiPath,
      headers: { 'Apollo-Require-Preflight': 'true' },
    }),
  }), [props.apiPath])

  return (
    <ApolloProvider client={apolloClient}>
      <InternalKeystoneProvider {...props} />
    </ApolloProvider>
  )
}


export function useRawKeystone () {
  const value = useContext(KeystoneContext)
  if (!value) throw new Error('useRawKeystone must be called inside a KeystoneProvider component')
  return value
}

export function useKeystone () {
  return useContext(KeystoneContext)
}

export function useList (listKey: string) {
  const { adminMeta } = useKeystone()
  const { lists } = adminMeta ?? {}
  const list = lists?.[listKey]
  if (!list) throw new Error(`Unknown list ${listKey}`)
  return list
}

export function useField (listKey: string, fieldKey: string) {
  const list = useList(listKey)
  const field = list.fields[fieldKey]
  if (!field) throw new Error(`Unknown field ${listKey}.${fieldKey}`)
  return field
}
