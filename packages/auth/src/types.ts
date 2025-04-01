import type { BaseListTypeInfo, KeystoneContext } from '@keystone-6/core/types'

type AuthenticatedItemId = string | number | undefined
type IsAny<T> = 0 extends 1 & T ? true : false

type CanDefaultAuthenticatedItemId<Session> =
  IsAny<Session> extends true
    ? false
    : 'sub' extends keyof Session
      ? Session['sub'] extends AuthenticatedItemId
        ? true
        : false
      : false

export type AuthConfig<ListTypeInfo extends BaseListTypeInfo> = {
  /** The key of the list to authenticate users with */
  listKey: ListTypeInfo['key']
  /** The path of the field the identity is stored in; must be text-ish */
  identityField: ListTypeInfo['fields']
  /** The path of the password field used to authenticate users */
  passwordField: ListTypeInfo['fields']
  /** How Keystone Auth should store/access auth information in headers/cookies. */
  sessionStrategy: {
    start: (args: {
      context: KeystoneContext<ListTypeInfo['all']>
      data: { sub: string }
    }) => Promise<string>
    end: (args: { context: KeystoneContext<ListTypeInfo['all']> }) => Promise<void>
  }
  /** Returns the authenticated item ID represented by a session. Defaults to `context.session?.sub` when omitted. */
  getAuthenticatedItemId?: (context: KeystoneContext<ListTypeInfo['all']>) => AuthenticatedItemId
} & (CanDefaultAuthenticatedItemId<ListTypeInfo['all']['session']> extends true
  ? {}
  : { getAuthenticatedItemId: {} })
