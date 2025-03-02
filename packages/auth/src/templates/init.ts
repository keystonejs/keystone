import type { BaseListTypeInfo } from '@keystone-6/core/types'
import type { AuthGqlNames, AuthConfig } from '../types'

export default function ({
  authGqlNames,
  listKey,
  initFirstItem,
}: {
  authGqlNames: AuthGqlNames
  listKey: string
  initFirstItem: NonNullable<AuthConfig<BaseListTypeInfo>['initFirstItem']>
}) {
  return `'use client'
import makeInitPage from '@keystone-6/auth/pages/InitPage'

export default makeInitPage(${JSON.stringify({
    listKey,
    authGqlNames,
    fieldPaths: initFirstItem.fields,
    enableWelcome: !initFirstItem.skipKeystoneWelcome,
  })})
`
}
