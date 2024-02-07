import React, { type ReactNode, createContext, useContext, useMemo } from 'react'
import { Center } from '@keystone-ui/core'
import { ToastProvider } from '@keystone-ui/toast'
import { LoadingDots } from '@keystone-ui/loading'
import { DrawerProvider } from '@keystone-ui/modals'
import { createUploadLink } from 'apollo-upload-client'
import type { AdminConfig, AdminMeta, FieldViews } from '../types'
import { useAdminMeta } from './utils/useAdminMeta'
import { ApolloProvider, ApolloClient, InMemoryCache } from './apollo'

type KeystoneContextType = {
  adminConfig: AdminConfig | null
  adminMeta: AdminMeta | null
  fieldViews: FieldViews
  apiPath: string | null
}

const KeystoneContext = createContext<KeystoneContextType>({
  adminConfig: null,
  adminMeta: null,
  fieldViews: {},
  apiPath: null
})

type KeystoneProviderProps = {
  children: ReactNode
  adminConfig: AdminConfig
  fieldViews: FieldViews
  apiPath: string
}

function InternalKeystoneProvider ({
  adminConfig,
  fieldViews,
  children,
  apiPath,
}: KeystoneProviderProps) {
  const adminMeta = useAdminMeta(fieldViews)
  if (adminMeta.state === 'loading') {
    return (
      <Center fillView>
        <LoadingDots label="Loading Admin Metadata" size="large" />
      </Center>
    )
  }

  return (
    <ToastProvider>
      <DrawerProvider>
        <KeystoneContext.Provider
          value={{
            adminConfig,
            adminMeta: adminMeta.value ?? null,
            fieldViews,
            apiPath,
          }}
        >
          {children}
        </KeystoneContext.Provider>
      </DrawerProvider>
    </ToastProvider>
  )
}

export function KeystoneProvider (props: KeystoneProviderProps) {
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

export function useKeystone () {
  return useContext(KeystoneContext)
}

export function useList (key: string) {
  const { adminMeta } = useKeystone()
  if (adminMeta?.lists[key]) return adminMeta.lists[key]
  throw new Error(`List '${key}' not found in meta`)
}
