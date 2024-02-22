import { text } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'

import type express from 'express'
import type { Options as BodyParserOptions } from 'body-parser'
import supertest from 'supertest'

import { setupTestRunner } from './test-runner'

function makeQuery (size = 0) {
  const query = JSON.stringify({
    variables: {
      data: {
        value: `Test ${Date.now()}`,
      },
    },
    query: `mutation ($data: ThingCreateInput!) {
      item: createThing(data: $data) {
        id
      }
    }`,
  }).slice(1, -1)
  const padding = Math.max(0, size - (query.length + 3))
  return `{ ${' '.repeat(padding)} ${query} }`
}

async function tryRequest (app: express.Express, size: number) {
  const res = await supertest(app)
    .post('/api/graphql')
    .send(makeQuery(size))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')

  return res
}

function setup (options?: BodyParserOptions) {
  return setupTestRunner({
    serve: true,
    config: {
      lists: {
        Thing: list({
          access: allowAll,
          fields: {
            value: text(),
          },
        }),
      },
      graphql: {
        bodyParser: {
          // limit: '100kb', // the body-parser default
          ...options,
        },
      },
    },
  })
}

describe('Configuring .graphql.bodyParser', () => {
  test(
    'defaults limits to 100KiB',
    setup()(async ({ express }) => {
      // <100KiB
      {
        const { status } = await tryRequest(express, 1024)
        expect(status).toEqual(200)
      }

      // === 100KiB
      {
        const { status } = await tryRequest(express, 100 * 1024)
        expect(status).toEqual(413)
      }

      // > 100KiB
      {
        const { status } = await tryRequest(express, 100 * 1024 + 1)
        expect(status).toEqual(413)
      }
    })
  )

  test(
    'supports changing the limit',
    setup({
      // actually 10MiB
      limit: '10mb',
    })(async ({ express }) => {
      // <10MiB
      {
        const { status } = await tryRequest(express, 1024)
        expect(status).toEqual(200)
      }

      // === 10MiB
      {
        const { status } = await tryRequest(express, 10 * 1024 * 1024)
        expect(status).toEqual(413)
      }

      // > 10MiB
      {
        const { status } = await tryRequest(express, 10 * 1024 * 1024 + 1)
        expect(status).toEqual(413)
      }
    })
  )
})
