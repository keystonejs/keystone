import { describe, expect, test, vi } from 'vitest'
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql/index.js'
import { createContext } from '../src/lib/context/createContext.ts'
import { addHeadersToResponse, headersFromRequest } from '../src/lib/context/node-headers.ts'

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: { noop: { type: GraphQLString } },
  }),
})

function makeContext(sessionConfig: { session?: any; getSession?: any }) {
  const prisma = {
    async $transaction(callback: (prisma: unknown) => unknown) {
      return callback(prisma)
    },
  }
  return createContext({
    config: sessionConfig as any,
    lists: {},
    graphQLSchemas: { public: schema, internal: schema },
    prismaClient: prisma,
    prismaTypes: { DbNull: {}, JsonNull: {} },
  })
}

describe('request context sessions', () => {
  test('adapts Node request and response headers at the server boundary', () => {
    const req = headersFromRequest({
      headers: { authorization: 'Bearer token', 'x-value': ['one', 'two'] },
    } as any)
    expect(req.get('authorization')).toBe('Bearer token')
    expect(req.get('x-value')).toBe('one, two')

    const values = new Map<string, string | string[]>()
    const res = {
      setHeader(name: string, value: string) {
        values.set(name.toLowerCase(), value)
      },
    } as any

    const headers = new Headers()
    headers.append('Set-Cookie', 'first=1')
    headers.append('Set-Cookie', 'second=2')
    addHeadersToResponse(headers, res)
    expect(values.get('set-cookie')).toEqual(['first=1', 'second=2'])
  })

  test('uses getSession with WHATWG requestHeaders', async () => {
    const getSession = vi.fn(async ({ context }) => ({
      authorization: context.req?.get('authorization'),
    }))
    const commonContext = makeContext({ getSession })
    const context = await commonContext.withHeaders(new Headers({ authorization: 'Bearer token' }))

    expect(context.req).toBeInstanceOf(Headers)
    expect(context.session).toEqual({ authorization: 'Bearer token' })
    expect(getSession).toHaveBeenCalledOnce()
  })

  test('clones requestHeaders and retains responseHeaders', async () => {
    const requestHeaders = new Headers({ authorization: 'original' })
    const responseHeaders = new Headers()
    const context = await makeContext({
      getSession: async () => ({ ok: true }),
    }).withHeaders(requestHeaders, responseHeaders)

    requestHeaders.set('authorization', 'changed')
    context.res?.set('x-result', 'ok')

    expect(context.req).not.toBe(requestHeaders)
    expect(context.req?.get('authorization')).toBe('original')
    expect(context.res).toBe(responseHeaders)
    expect(responseHeaders.get('x-result')).toBe('ok')
  })

  test('supports headers without getSession', async () => {
    const context = await makeContext({}).withHeaders(new Headers())
    expect(context.req).toBeInstanceOf(Headers)
    expect(context.session).toBeUndefined()
  })

  test.each([null, false, 0, ''])('rejects an invalid getSession result: %j', async value => {
    await expect(
      makeContext({ getSession: async () => value }).withHeaders(new Headers())
    ).rejects.toThrow('getSession must return a non-null object or undefined')
  })

  test('preserves request state through derived contexts without rehydrating', async () => {
    const getSession = vi.fn(async () => ({ itemId: '1' }))
    const responseHeaders = new Headers()
    const context = await makeContext({ getSession }).withHeaders(
      new Headers({ cookie: 'session=1' }),
      responseHeaders
    )

    for (const derived of [
      context.sudo(),
      context.internal(),
      context.withSession({ itemId: '2' }),
    ]) {
      expect(derived.req).toBe(context.req)
      expect(derived.res).toBe(responseHeaders)
    }
    const transactionContext = await context.transaction(async transaction => transaction)
    expect(transactionContext.req).toBe(context.req)
    expect(transactionContext.res).toBe(responseHeaders)
    expect(getSession).toHaveBeenCalledOnce()
  })

  test('writes responseHeaders to the supplied Headers object', async () => {
    const response = new Headers()
    const context = await makeContext({ getSession: async () => ({ ok: true }) }).withHeaders(
      new Headers(),
      response
    )

    context.res?.append('Set-Cookie', 'first=1')
    context.res?.append('Set-Cookie', 'second=2')

    expect(response.getSetCookie()).toEqual(['first=1', 'second=2'])
  })
})
