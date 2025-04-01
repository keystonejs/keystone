import type { BaseListTypeInfo, KeystoneContext } from '@keystone-6/core/types'
import type { SessionStrategy } from './session'

export type AuthGqlNames = {
  CreateInitialInput: string
  createInitialItem: string
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

export type AuthConfig<ListTypeInfo extends BaseListTypeInfo, SessionStrategySession> = {
  /** The key of the list to authenticate users with */
  listKey: ListTypeInfo['key']
  /** The path of the field the identity is stored in; must be text-ish */
  identityField: ListTypeInfo['fields']
  /** The path of the field the secret is stored in; must be password-ish */
  secretField: ListTypeInfo['fields']
  /** How Keystone Auth should store/access auth information in headers/cookies */
  sessionStrategy: SessionStrategy<{ itemId: string }, SessionStrategySession, ListTypeInfo['all']>
  /** Session hydration */
  getSession: (args: {
    data: SessionStrategySession
    context: KeystoneContext<ListTypeInfo['all']>
  }) => Promise<ListTypeInfo['all']['session'] | undefined>
  /** The initial user/db seeding functionality */
  initFirstItem?: InitFirstItemConfig<ListTypeInfo>
}

export type InitFirstItemConfig<ListTypeInfo extends BaseListTypeInfo> = {
  /** Array of fields to collect, e.g ['name', 'email', 'password'] */
  fields: readonly ListTypeInfo['fields'][]
  /** Suppresses the second screen where we ask people to subscribe and follow Keystone */
  skipKeystoneWelcome?: boolean
  /** Extra input to add for the create mutation */
  itemData?: Partial<ListTypeInfo['inputs']['create']>
}

export type AuthTokenRedemptionErrorCode = 'FAILURE' | 'TOKEN_EXPIRED' | 'TOKEN_REDEEMED'

export type SecretFieldImpl = {
  generateHash: (secret: string) => Promise<string>
  compare: (secret: string, hash: string) => Promise<boolean>
}
