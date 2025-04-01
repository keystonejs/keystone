import { describe, expect, test } from 'vitest'
import { decodeProtectedHeader } from 'jose/decode/protected_header'
import { decodeJwt } from 'jose/jwt/decode'
import { SignJWT } from 'jose/jwt/sign'
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
    const strategy = jwtSessions<{ sub: string }>({ secret })
    const res = new Headers()
    const token = await strategy.start({
      context: { req: new Headers(), res } as any,
      data: { sub: '1' },
    })

    expect(token).toBeTypeOf('string')
    expect(decodeProtectedHeader(token!)).toEqual({ alg: 'HS256' })
    expect(decodeJwt(token!)).toHaveProperty('iat', expect.any(Number))
    await expect(
      strategy.get({
        context: {
          req: new Headers({ authorization: `Bearer ${token}` }),
        } as any,
      })
    ).resolves.toEqual({ sub: '1', iat: expect.any(Number), exp: expect.any(Number) })
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

  test('rejects JWTs signed with another HMAC algorithm', async () => {
    const strategy = jwtSessions<{ sub: string }>({ secret })
    const token = await new SignJWT({ sub: '1' })
      .setProtectedHeader({ alg: 'HS384' })
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
})
