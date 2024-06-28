import React from 'react'
import { Core } from '@keystone-ui/core'
import { type DocumentNode } from 'graphql'
import { type AdminConfig, type FieldViews } from '../../../../types'
import { ErrorBoundary } from '../../../../admin-ui/components'
import { KeystoneProvider } from '../../../../admin-ui/context'

type AdminProps = {
  children: React.ReactNode
  config: AppConfig
}

type AppConfig = {
  adminConfig: AdminConfig
  adminMetaHash: string
  fieldViews: FieldViews
  lazyMetadataQuery: DocumentNode
  apiPath: string
}

export function Layout ({ children, config }: AdminProps) {
  return (
      <Core>
        <KeystoneProvider {...config}>
          <ErrorBoundary>
           {children}
          </ErrorBoundary>
        </KeystoneProvider>
      </Core>
    )
  }
