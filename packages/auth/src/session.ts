import * as cookie from 'cookie'
import { SignJWT } from 'jose/jwt/sign'
import { jwtVerify } from 'jose/jwt/verify'
import type { KeystoneContext, MaybePromise } from '@keystone-6/core/types'

type JwtSessionsOptions = {
  /**
   * Secret used to sign session data. Must be at least 32 characters or bytes long.
   * @default crypto.getRandomValues(new Uint8Array(32))
   */
  secret?: MaybePromise<string | Uint8Array<ArrayBuffer>>
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
    secret = crypto.getRandomValues(new Uint8Array(32)),
    maxAge = 60 * 60 * 8,
    cookieName = 'keystonejs-session',
    path = '/',
    secure = process.env.NODE_ENV === 'production',
    domain,
    sameSite = 'lax',
  } = options
  // just to check this eagerly for the common static case
  if ((typeof secret === 'string' || 'length' in secret) && secret.length < 32)
    throw new Error('The session secret must be at least 32 characters or bytes long')
  const key = (async () => {
    const resolved = await secret
    if (resolved.length < 32) {
      throw new Error('The session secret must be at least 32 characters or bytes long')
    }
    const secretBytes = typeof resolved === 'string' ? new TextEncoder().encode(resolved) : resolved
    return crypto.subtle.importKey('raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, [
      'sign',
      'verify',
    ])
  })()

  return {
    async get({
      context,
    }: {
      context: KeystoneContext<any>
    }): Promise<(Session & { iat: number; exp: number }) | undefined> {
      const token = getToken(context, cookieName)
      if (!token) return
      try {
        const { payload, protectedHeader } = await jwtVerify(token, await key, {
          algorithms: ['HS256'],
          maxTokenAge: maxAge,
          requiredClaims: ['iat', 'exp'],
        })
        // this should strictly speaking be unnecessary but just to double check
        if (protectedHeader.alg !== 'HS256') return
        if (!payload || typeof payload !== 'object') return
        if (!('iat' in payload) || !('exp' in payload)) return
        if (typeof payload.iat !== 'number' || typeof payload.exp !== 'number') return
        return payload as Session & { iat: number; exp: number }
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
      const issuedAtMs = Date.now()
      const expires = new Date(issuedAtMs + maxAge * 1000)
      if ('iat' in data || 'exp' in data) {
        throw new Error('Session data cannot contain `iat` or `exp` properties')
      }
      const token = await new SignJWT(data as JwtPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(new Date(issuedAtMs))
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

export type SessionStore<Session> = {
  get(key: string): MaybePromise<Session | undefined>
  set(key: string, value: Session): void | Promise<void>
  delete(key: string): void | Promise<void>
}

export type SessionStoreFunction<Session> = (args: {
  /** The number of seconds that a cookie session is valid for. */
  maxAge: number
}) => SessionStore<Session>

function toBase64Url(bytes: Uint8Array) {
  if (bytes.toBase64) return bytes.toBase64({ alphabet: 'base64url', omitPadding: true })
  const value = Array.from(bytes, byte => String.fromCodePoint(byte)).join('')
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
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
