import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'

import supertest from 'supertest'
import { setupTestRunner } from './test-runner'

const runner = setupTestRunner({
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
    server: {
      extendExpressApp: app => {
        app.get('/magic', (req, res) => {
          res.json({ magic: true })
        })
      },
    },
  }
})

test('basic extension', runner(async ({ express }) => {
  const { text } = await supertest(express)
    .get('/magic')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  expect(JSON.parse(text)).toEqual({
    magic: true,
  })
}))
