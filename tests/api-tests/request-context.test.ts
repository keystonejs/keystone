import { expect, test } from 'vitest'
import supertest from 'supertest'
import { list } from '@keystone-6/core'
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
        context.res?.set('x-request-forwarded-for', context.req?.get('x-forwarded-for') ?? '')
        context.res?.append('set-cookie', 'first=1')
        context.res?.append('set-cookie', 'second=2')
        return { authorization: context.req?.get('authorization') }
      },
      async start() {},
      async end() {},
    },
    server: {
      extendExpressApp(app) {
        app.use((req, _res, next) => {
          req.headers['x-forwarded-for'] = req.socket.remoteAddress
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
      .set('x-forwarded-for', 'spoofed')
      .send({ query: '{ __typename }' })
      .expect(200)

    expect(response.headers['x-request-authorization']).toBe('Bearer token')
    expect(response.headers['x-request-forwarded-for']).toBeTruthy()
    expect(response.headers['x-request-forwarded-for']).not.toBe('spoofed')
    expect(response.headers['set-cookie']).toEqual(['first=1', 'second=2'])
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
