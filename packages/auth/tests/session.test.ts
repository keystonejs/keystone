import { describe, expect, test, vi } from 'vitest'
import { decodeProtectedHeader } from 'jose/decode/protected_header'
import { exportJWK } from 'jose/key/export'
import { generateKeyPair } from 'jose/key/generate/keypair'
import { decodeJwt } from 'jose/jwt/decode'
import { SignJWT } from 'jose/jwt/sign'
import { UnsecuredJWT } from 'jose/jwt/unsecured'
import { jwtSessions } from '../src/index.ts'

const secret = 'x'.repeat(32)

describe('built-in session strategies', () => {
  test('generates a random secret by default', async () => {
    const strategy = jwtSessions<{ sub: string }>()
    const anotherStrategy = jwtSessions<{ sub: string }>()
    const token = await strategy.start({ context: {} as any, data: { sub: '1' } })
    const context = { req: new Headers({ authorization: `Bearer ${token}` }) } as any

    await expect(strategy.get({ context })).resolves.toMatchObject({ sub: '1' })
    await expect(anotherStrategy.get({ context })).resolves.toBeUndefined()
  })

  test('requires response headers when request headers are present', async () => {
    const strategy = jwtSessions<{ sub: string }>({ secret })

    await expect(strategy.start({ context: {} as any, data: { sub: '1' } })).resolves.toEqual(
      expect.any(String)
    )
    await expect(
      strategy.start({
        context: { req: new Headers() } as any,
        data: { sub: '1' },
      })
    ).rejects.toThrow('Session start and end require res when using withHeaders')
  })

  test('preserves multiple WHATWG Set-Cookie values', async () => {
    const strategy = jwtSessions<{ sub: string }>({ secret })
    const res = new Headers()
    const context = { req: new Headers(), res } as any

    await strategy.start({ context, data: { sub: '1' } })
    await strategy.start({ context, data: { sub: '2' } })

    expect(res.getSetCookie()).toHaveLength(2)
  })

  test('round trips session data in an HS256 JWT', async () => {
    vi.useFakeTimers()
    try {
      const now = new Date('2026-09-01T00:00:00.000Z')
      const nowInSeconds = now.getTime() / 1000
      vi.setSystemTime(now)

      const strategy = jwtSessions<{ sub: string }>({ secret, maxAge: 60 })
      const res = new Headers()
      const token = await strategy.start({
        context: { req: new Headers(), res } as any,
        data: { sub: '1' },
      })
      const expectedPayload = { sub: '1', iat: nowInSeconds, exp: nowInSeconds + 60 }

      expect(token).toBeTypeOf('string')
      expect(decodeProtectedHeader(token)).toEqual({ alg: 'HS256' })
      expect(decodeJwt(token)).toEqual(expectedPayload)
      await expect(
        strategy.get({
          context: {
            req: new Headers({ authorization: `Bearer ${token}` }),
          } as any,
        })
      ).resolves.toEqual(expectedPayload)
    } finally {
      vi.useRealTimers()
    }
  })

  test.each([
    ['without an iat claim', false, true],
    ['without an exp claim', true, false],
    ['without iat and exp claims', false, false],
  ] as const)('rejects JWTs %s', async (_, includeIat, includeExp) => {
    const strategy = jwtSessions<{ sub: string }>({ secret, maxAge: 60 })
    const now = Math.floor(Date.now() / 1000)
    let tokenBuilder = new SignJWT({ sub: '1' }).setProtectedHeader({ alg: 'HS256' })
    if (includeIat) tokenBuilder = tokenBuilder.setIssuedAt(now)
    if (includeExp) tokenBuilder = tokenBuilder.setExpirationTime(now + 60)
    const token = await tokenBuilder.sign(new TextEncoder().encode(secret))

    await expect(
      strategy.get({
        context: {
          req: new Headers({ authorization: `Bearer ${token}` }),
        } as any,
      })
    ).resolves.toBeUndefined()
  })

  test.each([
    ['with an iat property', { sub: '1', iat: 1 }],
    ['with an exp property', { sub: '1', exp: 1 }],
    ['with iat and exp properties', { sub: '1', iat: 1, exp: 1 }],
  ] as const)('rejects session data %s', async (_, data) => {
    const strategy = jwtSessions<{ sub: string; iat?: number; exp?: number }>({ secret })

    await expect(strategy.start({ context: {} as any, data })).rejects.toThrow(
      'Session data cannot contain `iat` or `exp` properties'
    )
  })

  test('rejects JWTs older than maxAge even when they have not expired', async () => {
    const strategy = jwtSessions<{ sub: string }>({ secret, maxAge: 60 })
    const now = Math.floor(Date.now() / 1000)
    const token = await new SignJWT({ sub: '1' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now - 120)
      .setExpirationTime(now + 60 * 60)
      .sign(new TextEncoder().encode(secret))

    await expect(
      strategy.get({
        context: {
          req: new Headers({ authorization: `Bearer ${token}` }),
        } as any,
      })
    ).resolves.toBeUndefined()
  })

  test.each(['HS384', 'HS512'] as const)('rejects JWTs signed with %s', async algorithm => {
    const strategy = jwtSessions<{ sub: string }>({ secret })
    const token = await new SignJWT({ sub: '1' })
      .setProtectedHeader({ alg: algorithm })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(secret))

    await expect(
      strategy.get({
        context: {
          req: new Headers({ authorization: `Bearer ${token}` }),
        } as any,
      })
    ).resolves.toBeUndefined()
  })

  test('rejects unsecured JWTs using the none algorithm', async () => {
    const strategy = jwtSessions<{ sub: string }>({ secret })
    const token = new UnsecuredJWT({ sub: '1' }).setIssuedAt().setExpirationTime('1h').encode()

    await expect(
      strategy.get({
        context: {
          req: new Headers({ authorization: `Bearer ${token}` }),
        } as any,
      })
    ).resolves.toBeUndefined()
  })

  test('rejects JWTs signed with an asymmetric algorithm', async () => {
    const strategy = jwtSessions<{ sub: string }>({ secret })
    const { privateKey } = await generateKeyPair('RS256')
    const token = await new SignJWT({ sub: '1' })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(privateKey)

    await expect(
      strategy.get({
        context: {
          req: new Headers({ authorization: `Bearer ${token}` }),
        } as any,
      })
    ).resolves.toBeUndefined()
  })

  test('rejects JWTs signed with a key supplied in the protected header', async () => {
    const strategy = jwtSessions<{ sub: string }>({ secret })
    const attackerSecret = new TextEncoder().encode('a'.repeat(32))
    const { publicKey } = await generateKeyPair('RS256')
    const token = await new SignJWT({ sub: '1' })
      .setProtectedHeader({
        alg: 'HS256',
        jwk: await exportJWK(publicKey),
      })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(attackerSecret)

    await expect(
      strategy.get({
        context: {
          req: new Headers({ authorization: `Bearer ${token}` }),
        } as any,
      })
    ).resolves.toBeUndefined()
  })
})
