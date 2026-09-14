import type { BaseListTypeInfo, KeystoneContext } from '@keystone-6/core/types'

type AuthenticatedItemId = string | number | undefined

export type AuthConfig<ListTypeInfo extends BaseListTypeInfo> = {
  /** The key of the list to authenticate users with */
  listKey: ListTypeInfo['key']
  /** The key of the field the identity is stored in, must be text-ish */
  identityField: ListTypeInfo['fields']
  /** The key of the password field used to authenticate users */
  passwordField: ListTypeInfo['fields']
  /** How Keystone Auth should start and end sessions */
  sessionStrategy: {
    start: (args: {
      context: KeystoneContext<ListTypeInfo['all']>
      data: { sub: string }
    }) => Promise<string>
    end: (args: { context: KeystoneContext<ListTypeInfo['all']> }) => Promise<void>
  }
  /** Returns the authenticated item ID represented by a session. */
  getAuthenticatedItemId: (context: KeystoneContext<ListTypeInfo['all']>) => AuthenticatedItemId
}
