import type { MaybePromise } from './utils.ts'

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
