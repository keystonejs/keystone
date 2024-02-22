import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'
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
        },
      }),
    },
    server: {
      extendHttpServer: server => {
        server.prependListener('request', (req, res) => {
          res.setHeader('test-header', 'test-header-value')
        })
      },
    },
  },
})

test('server extension', runner(async ({ http }) => {
  await supertest(http).get('/anything').expect('test-header', 'test-header-value')
}))
