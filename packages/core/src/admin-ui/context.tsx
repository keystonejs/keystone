import { createUploadLink } from 'apollo-upload-client'
import NextHead from 'next/head'
import { useRouter } from 'next/router'
import React, { type ReactNode, createContext, useContext, useEffect, useMemo } from 'react'

import {
  ClientSideOnlyDocumentElement,
  KeystarProvider,
} from '@keystar/ui/core'
import { injectGlobal, tokenSchema } from '@keystar/ui/style'
import { Toaster } from '@keystar/ui/toast'

import { Center } from '@keystone-ui/core'
import { LoadingDots } from '@keystone-ui/loading'
import { DrawerProvider } from '@keystone-ui/modals'
import { ToastProvider } from '@keystone-ui/toast'

import type { AdminConfig, AdminMeta, FieldViews } from '../types'
import {
  type ApolloError,
  type DocumentNode,
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
} from './apollo'
import { useAdminMeta } from './utils/useAdminMeta'
import {
  type CreateViewFieldModes,
  type VisibleLists,
  useLazyMetadata,
} from './utils/useLazyMetadata'

type KeystoneContextType = {
  adminConfig: AdminConfig
  adminMeta:
    | { state: 'loaded', value: AdminMeta }
    | { state: 'error', error: ApolloError, refetch: () => Promise<void> }
  fieldViews: FieldViews
  visibleLists: VisibleLists
  createViewFieldModes: CreateViewFieldModes
  reinitContext: () => Promise<void>
  apiPath: string
}

const KeystoneContext = createContext<KeystoneContextType | undefined>(undefined)

type KeystoneProviderProps = {
  adminConfig: AdminConfig
  adminMetaHash: string
  apiPath: string
  children: ReactNode
  fieldViews: FieldViews
  lazyMetadataQuery: DocumentNode
}

function InternalKeystoneProvider ({
  adminConfig,
  adminMetaHash,
  apiPath,
  children,
  fieldViews,
  lazyMetadataQuery,
}: KeystoneProviderProps) {
  const { push: navigate } = useRouter()
  const keystarRouter = useMemo(() => ({ navigate }), [navigate])
  const adminMeta = useAdminMeta(adminMetaHash, fieldViews)
  const { visibleLists, createViewFieldModes, refetch } = useLazyMetadata(lazyMetadataQuery)
  const reinitContext = async () => {
    await adminMeta?.refetch?.()
    await refetch()
  }

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

  if (adminMeta.state === 'loading') {
    return (
      <Center fillView>
        <LoadingDots label="Loading Admin Metadata" size="large" />
      </Center>
    )
  }

  return (
    <KeystarProvider router={keystarRouter}>
      <ClientSideOnlyDocumentElement bodyBackground="surface" />
      <NextHead>
        <meta
          key="viewport"
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </NextHead>

      <ToastProvider>
        <DrawerProvider>
          <KeystoneContext.Provider
            value={{
              adminConfig,
              adminMeta,
              fieldViews,
              reinitContext,
              visibleLists,
              createViewFieldModes,
              apiPath,
            }}
          >
            {children}
          </KeystoneContext.Provider>
        </DrawerProvider>
      </ToastProvider>
      <Toaster />
    </KeystarProvider>
  )
}

export function KeystoneProvider (props: KeystoneProviderProps) {
  const apolloClient = useMemo(
    () =>
      new ApolloClient({
        cache: new InMemoryCache(),
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

export function useKeystone (): {
  adminConfig: AdminConfig
  adminMeta: AdminMeta
  visibleLists: VisibleLists
  createViewFieldModes: CreateViewFieldModes
  apiPath: string
} {
  const value = useContext(KeystoneContext)
  if (!value) throw new Error('useKeystone must be called inside a KeystoneProvider component')
  if (value.adminMeta.state === 'error') throw new Error('An error occurred when loading Admin Metadata')

  return {
    adminConfig: value.adminConfig,
    adminMeta: value.adminMeta.value,
    visibleLists: value.visibleLists,
    createViewFieldModes: value.createViewFieldModes,
    apiPath: value.apiPath,
  }
}

export function useReinitContext () {
  const value = useContext(KeystoneContext)
  if (value) return value.reinitContext
  throw new Error('useReinitContext must be called inside a KeystoneProvider component')
}

export function useRawKeystone () {
  const value = useContext(KeystoneContext)
  if (value) return value
  throw new Error('useRawKeystone must be called inside a KeystoneProvider component')
}

export function useList (listKey: string) {
  const {
    adminMeta: { lists },
  } = useKeystone()
  const list = lists[listKey]
  if (!list) throw new Error(`Unknown field ${listKey}`)
  return list
}

export function useField (listKey: string, fieldKey: string) {
  const list = useList(listKey)
  const field = list.fields[fieldKey]
  if (!field) throw new Error(`Unknown field ${listKey}.${fieldKey}`)
  return field
}
