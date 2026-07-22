import type { BaseListTypeInfo, KeystoneContext } from '@keystone-6/core/types'

export type AuthGqlNames = {
  itemQueryName: string
  whereUniqueInputName: string

  authenticateItemWithPassword: string
  ItemAuthenticationWithPasswordResult: string
  ItemAuthenticationWithPasswordSuccess: string
  ItemAuthenticationWithPasswordFailure: string
}

export type SendTokenFn = (args: {
  itemId: string | number | bigint
  identity: string
  token: string
  context: KeystoneContext
}) => Promise<void> | void

export type AuthTokenTypeConfig = {
  /** Called when a user should be sent the magic signin token they requested */
  sendToken: SendTokenFn
  /** How long do tokens stay valid for from time of issue, in minutes **/
  tokensValidForMins?: number
}

export type AuthConfig<ListTypeInfo extends BaseListTypeInfo> = {
  /** The key of the list to authenticate users with */
  listKey: ListTypeInfo['key']
  /** The path of the field the identity is stored in; must be text-ish */
  identityField: ListTypeInfo['fields']
  /** The path of the field the secret is stored in; must be password-ish */
  secretField: ListTypeInfo['fields']
  /**
   * Session data population
   *
   * WARNING: uses sudo to retrieve this data
   */
  sessionData?: string
}
