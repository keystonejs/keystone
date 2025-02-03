import React from 'react'
import type { AppProps } from 'next/app'
import type { AdminConfig, FieldViews } from '../../../../types'
import { ErrorBoundary } from '../../../../admin-ui/components'
import { KeystoneProvider } from '../../../../admin-ui/context'

type AppConfig = {
  adminConfig: AdminConfig
  fieldViews: FieldViews
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
