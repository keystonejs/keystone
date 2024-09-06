import React from 'react'
import { type AppProps } from 'next/app'
import { type DocumentNode } from 'graphql'

import { type AdminConfig, type FieldViews } from '../../../../types'
import { ErrorBoundary } from '../../../../admin-ui/components'
import { KeystoneProvider } from '../../../../admin-ui/context'

type AppConfig = {
  adminConfig: AdminConfig
  adminMetaHash: string
  fieldViews: FieldViews
  lazyMetadataQuery: DocumentNode
  apiPath: string
}

export const getApp =
  (props: AppConfig) =>
  ({ Component, pageProps }: AppProps) => {
    return (
      <KeystoneProvider {...props}>
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </KeystoneProvider>
    )
  }
