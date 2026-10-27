import { expect, test } from 'vitest'
import supertest from 'supertest'
import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { file } from '@keystone-6/fields-media-multipart'
// @ts-expect-error graphql-upload does not provide TypeScript declarations
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'
import { setupTestRunner } from './test-runner.ts'
import { inMemoryStorageStrategy } from './fields/storage-utils.ts'

const { storage, files } = inMemoryStorageStrategy()
const runner = setupTestRunner({
  serve: true,
  config: {
    server: {
      extendExpressApp(app) {
        app.use(graphqlUploadExpress({ maxFileSize: 16 }))
      },
    },
    lists: {
      Asset: list({
        access: allowAll,
        fields: { file: file({ storage }) },
      }),
    },
  },
})

test(
  'explicit middleware supports multipart uploads and enforces file size limits',
  runner(async ({ express }) => {
    const upload = (contents: Buffer) =>
      supertest(express)
        .post('/api/graphql')
        .set('Apollo-Require-Preflight', 'true')
        .field(
          'operations',
          JSON.stringify({
            query: `mutation ($file: Upload!) {
              createAsset(data: { file: { upload: $file } }) {
                file { filename filesize }
              }
            }`,
            variables: { file: null },
          })
        )
        .field('map', JSON.stringify({ '0': ['variables.file'] }))
        .attach('0', contents, 'example.txt')

    const contents = Buffer.from('hello')
    const success = await upload(contents)
    expect(success.status).toBe(200)
    expect(success.body.errors).toBeUndefined()
    const value = success.body.data.createAsset.file
    expect(value.filesize).toBe(contents.length)
    expect(files.get(value.filename)).toEqual(contents)

    const oversized = await upload(Buffer.alloc(17))
    expect(oversized.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining('File truncated as it exceeds the 16 byte size limit.'),
        }),
      ])
    )
    expect(files.size).toBe(1)
  })
)
