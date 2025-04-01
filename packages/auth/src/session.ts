import * as cookie from 'cookie'
import { SignJWT } from 'jose/jwt/sign'
import { jwtVerify } from 'jose/jwt/verify'
import type { KeystoneContext, SessionStoreFunction } from '@keystone-6/core/types'

export type { SessionStore, SessionStoreFunction } from '@keystone-6/core/types'

type JwtSessionsOptions = {
  /**
   * Secret used to sign session data. Must be at least 32 characters long.
   * @default a random 256-bit secret
   */
  secret?: string
  /** Session lifetime in seconds. @default 8 hours */
  maxAge?: number
  /** @default 'keystonejs-session' */
  cookieName?: string
  /** @default process.env.NODE_ENV === 'production' */
  secure?: boolean
  /** @default '/' */
  path?: string
  domain?: string
  /** @default 'lax' */
  sameSite?: true | false | 'lax' | 'strict' | 'none'
}

type JwtPayload = NonNullable<ConstructorParameters<typeof SignJWT>[0]>

function toHex(bytes: Uint8Array) {
  if (bytes.toHex) return bytes.toHex()
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function getToken(context: KeystoneContext<any>, cookieName: string) {
  if (!context.req) return

  const authorization = context.req.get('authorization') ?? ''
  if (authorization.startsWith('Bearer ')) return authorization.slice('Bearer '.length)

  return cookie.parse(context.req.get('cookie') || '')[cookieName]
}

function assertCanWriteSession(context: KeystoneContext<any>) {
  if (context.req) throw new Error('Session start and end require res when using withHeaders')
}

function appendSetCookie(context: KeystoneContext<any>, value: string) {
  context.res?.append('Set-Cookie', value)
}

export function jwtSessions<Session extends object = { sub: string }>(
  options: JwtSessionsOptions = {}
) {
  const {
    secret = toHex(crypto.getRandomValues(new Uint8Array(32))),
    maxAge = 60 * 60 * 8,
    cookieName = 'keystonejs-session',
    path = '/',
    secure = process.env.NODE_ENV === 'production',
    domain,
    sameSite = 'lax',
  } = options
  if (secret.length < 32) throw new Error('The session secret must be at least 32 characters long')
  const secretBytes = new TextEncoder().encode(secret)
  const key = crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )

  return {
    async get({ context }: { context: KeystoneContext<any> }): Promise<Session | undefined> {
      const token = getToken(context, cookieName)
      if (!token) return
      try {
        const { payload } = await jwtVerify(
          token,
          // just to make absolutely sure that the key is only used for HS256
          x => {
            if (x.alg !== 'HS256') throw new Error('Invalid algorithm')
            return key
          },
          {
            algorithms: ['HS256'],
            maxTokenAge: maxAge,
          }
        )
        return payload as Session
      } catch {
        // Invalid session tokens are treated as unauthenticated.
      }
    },
    async end({ context }: { context: KeystoneContext<any> }): Promise<void> {
      if (!context.res) assertCanWriteSession(context)
      appendSetCookie(
        context,
        cookie.serialize(cookieName, '', {
          maxAge: 0,
          expires: new Date(),
          httpOnly: true,
          secure,
          path,
          sameSite,
          domain,
        })
      )
    },
    async start({
      context,
      data,
    }: {
      context: KeystoneContext<any>
      data: Session
    }): Promise<string> {
      if (!context.res) assertCanWriteSession(context)
      const expires = new Date(Date.now() + maxAge * 1000)
      const token = await new SignJWT(data as JwtPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expires)
        .sign(await key)
      appendSetCookie(
        context,
        cookie.serialize(cookieName, token, {
          maxAge,
          expires,
          httpOnly: true,
          secure,
          path,
          sameSite,
          domain,
        })
      )
      return token
    },
  }
}

export function storedSessions<Session = { sub: string }>({
  store: storeFn,
  maxAge = 60 * 60 * 8,
  ...jwtSessionsOptions
}: {
  store: SessionStoreFunction<Session>
} & JwtSessionsOptions) {
  const jwt = jwtSessions<{ jti: string }>({ ...jwtSessionsOptions, maxAge })
  const store = storeFn({ maxAge })

  return {
    async get({ context }: { context: KeystoneContext<any> }): Promise<Session | undefined> {
      const sessionId = (await jwt.get({ context }))?.jti
      if (!sessionId) return
      return store.get(sessionId)
    },
    async start({
      context,
      data,
    }: {
      context: KeystoneContext<any>
      data: Session
    }): Promise<string> {
      if (!context.res) assertCanWriteSession(context)
      const sessionId = toBase64Url(crypto.getRandomValues(new Uint8Array(24)))
      await store.set(sessionId, data)
      return jwt.start({ context, data: { jti: sessionId } })
    },
    async end({ context }: { context: KeystoneContext<any> }): Promise<void> {
      if (!context.res) assertCanWriteSession(context)
      const sessionId = (await jwt.get({ context }))?.jti
      if (!sessionId) return
      await store.delete(sessionId)
      await jwt.end({ context })
    },
  }
}
