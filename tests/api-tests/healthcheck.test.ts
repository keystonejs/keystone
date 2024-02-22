import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import supertest from 'supertest'

function runner (healthCheck: any) {
  return setupTestRunner({
    serve: true,
    config: {
      lists: {
        User: list({
          access: allowAll,
          fields: {
            name: text()
          }
        }),
      },
      server: { healthCheck },
    },
  })
}

test('No health check', runner(undefined)(async ({ express }) => {
  await supertest(express).get('/_healthcheck').set('Accept', 'expresslication/json').expect(404)
}))

test('Default health check', runner(true)(async ({ express }) => {
  const { text } = await supertest(express)
    .get('/_healthcheck')
    .set('Accept', 'expresslication/json')
    .expect('Content-Type', /json/)
    .expect(200)

  expect(JSON.parse(text)).toEqual({
    status: 'pass',
    timestamp: expect.any(Number),
  })
}))

test('Custom path', runner({ path: '/custom' })(async ({ express }) => {
  const { text } = await supertest(express)
    .get('/custom')
    .set('Accept', 'expresslication/json')
    .expect('Content-Type', /json/)
    .expect(200)
  expect(JSON.parse(text)).toEqual({
    status: 'pass',
    timestamp: expect.any(Number),
  })
}))

test('Custom data: object', runner({ data: { foo: 'bar' } })(async ({ express }) => {
  const { text } = await supertest(express)
    .get('/_healthcheck')
    .set('Accept', 'expresslication/json')
    .expect('Content-Type', /json/)
    .expect(200)
  expect(JSON.parse(text)).toEqual({ foo: 'bar' })
}))

test('Custom data: function', runner({ data: () => ({ foo: 'bar' }) })(async ({ express }) => {
  const { text } = await supertest(express)
    .get('/_healthcheck')
    .set('Accept', 'expresslication/json')
    .expect('Content-Type', /json/)
    .expect(200)
  expect(JSON.parse(text)).toEqual({ foo: 'bar' })
}))
