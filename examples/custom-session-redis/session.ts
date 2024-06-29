import { randomBytes } from 'crypto'
import { createClient } from '@redis/client'
import type { MaybePromise, SessionStrategy } from '@keystone-6/core/types'
import { statelessSessions } from '@keystone-6/core/session'
import type { Session } from './schema'

export type SessionStore<Session> = {
  get(key: string): MaybePromise<Session | undefined>
  set(key: string, value: Session): void | Promise<void>
  delete(key: string): void | Promise<void>
}

export type SessionStoreFunction<Session> = (args: {
  /**
   * The number of seconds that a cookie session be valid for
   */
  maxAge: number
}) => SessionStore<Session>


function storedSessions<Session> ({
  store: storeFn,
  maxAge = 60 * 60 * 8, // 8 hours
  ...statelessSessionsOptions
}: {
  store: SessionStoreFunction<Session>
} & { maxAge?: number}): SessionStrategy<Session, any> {
  const stateless = statelessSessions<string>({ ...statelessSessionsOptions, maxAge })
  const store = storeFn({ maxAge })

  return {
    async get ({ context }) {
      const sessionId = await stateless.get({ context })
      if (!sessionId) return

      return store.get(sessionId)
    },
    async start ({ context, data }) {
      const sessionId = randomBytes(24).toString('base64url') // 192-bit
      await store.set(sessionId, data)
      return stateless.start({ context, data: sessionId }) || ''
    },
    async end ({ context }) {
      const sessionId = await stateless.get({ context })
      if (!sessionId) return

      await store.delete(sessionId)
      await stateless.end({ context })
    },
  }
}

export const redis = createClient()

export function redisSessionStrategy () {
  // you can find out more at https://keystonejs.com/docs/apis/session#session-api
  return storedSessions<Session>({
    store: ({ maxAge }) => ({
      async get (sessionId) {
        const result = await redis.get(sessionId)
        if (!result) return

        return JSON.parse(result) as Session
      },

      async set (sessionId, data) {
        // we use redis for our Session data, in JSON
        await redis.setEx(sessionId, maxAge, JSON.stringify(data))
      },

      async delete (sessionId) {
        await redis.del(sessionId)
      },
    }),
  })
}