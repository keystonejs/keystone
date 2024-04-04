import type { MaybePromise } from './utils'
import type { BaseKeystoneTypeInfo, KeystoneContext } from '.'

export type SessionStrategy<
  Session,
  TypeInfo extends BaseKeystoneTypeInfo = BaseKeystoneTypeInfo
> = {
  get: (args: { context: KeystoneContext<TypeInfo> }) => Promise<Session | undefined>
  start: (args: { context: KeystoneContext<TypeInfo>, data: Session }) => Promise<unknown>
  end: (args: { context: KeystoneContext<TypeInfo> }) => Promise<unknown>
}

/** @deprecated */
export type SessionStore<Session> = {
  get(key: string): MaybePromise<Session | undefined>
  set(key: string, value: Session): void | Promise<void>
  delete(key: string): void | Promise<void>
}

/** @deprecated */
export type SessionStoreFunction<Session> = (args: {
  /**
   * The number of seconds that a cookie session be valid for
   */
  maxAge: number
}) => SessionStore<Session>
