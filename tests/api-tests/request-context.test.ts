import { expect, test } from 'vitest'
import { setImmediate } from 'node:timers/promises'
import supertest from 'supertest'
import { g, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'
import { setupTestRunner } from './test-runner.ts'

const runner = setupTestRunner({
  serve: true,
  config: {
    lists: {
      User: list({ access: allowAll, fields: { name: text() } }),
    },
    session: {
      async get({ context }) {
        context.res?.set('x-request-authorization', context.req?.get('authorization') ?? '')
        context.res?.set('x-request-empty', context.req?.get('x-empty') ?? 'missing')
        context.res?.set('x-request-remote-address', context.req?.get('x-remote-address') ?? '')
        context.res?.append('set-cookie', 'first=1')
        context.res?.append('set-cookie', 'second=2')
        return { authorization: context.req?.get('authorization') }
      },
      async start() {},
      async end() {},
    },
    graphql: {
      apolloConfig: {
        allowBatchedHttpRequests: true,
      },
      extendGraphqlSchema: g.extend(() => ({
        query: {
          slow: g.field({
            type: g.Boolean,
            async resolve(_root, _args, context) {
              await setImmediate()
              context.res?.set('x-async-header', 'finished')
              context.res?.append('set-cookie', 'async=1')
              return true
            },
          }),
        },
      })),
    },
    server: {
      extendExpressApp(app) {
        app.use((req, res, next) => {
          req.headers['x-remote-address'] = req.socket.remoteAddress
          // cookies set by middleware must be kept alongside cookies set through context.res
          res.append('set-cookie', 'middleware=1')
          next()
        })
      },
    },
  },
})

test(
  'adapts request and response headers at the Express boundary',
  runner(async ({ express }) => {
    const response = await supertest(express)
      .post('/api/graphql')
      .set('authorization', 'Bearer token')
      .set('x-empty', '')
      .set('x-remote-address', 'spoofed')
      .send({ query: '{ __typename }' })
      .expect(200)

    expect(response.headers['x-request-authorization']).toBe('Bearer token')
    expect(response.headers['x-request-empty']).toBe('')
    expect(response.headers['x-request-remote-address']).toBeTruthy()
    expect(response.headers['x-request-remote-address']).not.toBe('spoofed')
    expect(response.headers['set-cookie']).toEqual(['middleware=1', 'first=1', 'second=2'])
  })
)

test(
  'creates request contexts from Headers',
  runner(async ({ context }) => {
    const requestHeaders = new Headers({ authorization: 'original' })
    const responseHeaders = new Headers()
    const requestContext = await context.withHeaders(requestHeaders, responseHeaders)

    requestHeaders.set('authorization', 'changed')

    expect(requestContext.req).not.toBe(requestHeaders)
    expect(requestContext.req?.get('authorization')).toBe('original')
    expect(requestContext.res).toBe(responseHeaders)
    expect(requestContext.session).toEqual({ authorization: 'original' })

    for (const derived of [
      requestContext.sudo(),
      requestContext.internal(),
      requestContext.withSession({ authorization: 'replacement' }),
    ]) {
      expect(derived.req).toBe(requestContext.req)
      expect(derived.res).toBe(responseHeaders)
    }

    const transactionContext = await requestContext.transaction(async transaction => transaction)
    expect(transactionContext.req).toBe(requestContext.req)
    expect(transactionContext.res).toBe(responseHeaders)
  })
)

for (const batched of [false, true]) {
  test(
    `flushes headers from async resolvers${batched ? ' for every operation in a batch' : ''}`,
    runner(async ({ express }) => {
      const response = await supertest(express)
        .post('/api/graphql')
        .send(
          batched
            ? [
                { query: 'query Fast { __typename }', operationName: 'Fast' },
                { query: 'query Slow { slow }', operationName: 'Slow' },
              ]
            : { query: 'query AsyncHeaders { slow }', operationName: 'AsyncHeaders' }
        )
        .expect(200)

      expect(response.headers['x-async-header']).toBe('finished')
      expect(response.headers['set-cookie']).toEqual([
        'middleware=1',
        'first=1',
        'second=2',
        'async=1',
      ])
      expect(response.body).toEqual(
        batched
          ? [{ data: { __typename: 'Query' } }, { data: { slow: true } }]
          : { data: { slow: true } }
      )
    })
  )
}
