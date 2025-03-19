import { file, text } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import {
  noopStorageStrategy,
  inMemoryStorageStrategy,
  prepareTestFile,
  readTestFile,
  collectStream,
} from './storage-utils'
import { Readable } from 'node:stream'
// @ts-expect-error
import Upload from 'graphql-upload/Upload.js'
import { randomBytes } from 'node:crypto'
import type { BaseKeystoneTypeInfo, StorageStrategy } from '@keystone-6/core/types'

jest.setTimeout(10000)

function getRunner(opts: Parameters<typeof file>[0]) {
  return setupTestRunner({
    config: {
      lists: {
        Test: list({
          access: allowAll,
          fields: {
            name: text(),
            secretFile: file(opts),
          },
        }),
      },
    },
  })
}

const createItem = (context: any) =>
  context.query.Test.createOne({
    data: { secretFile: prepareTestFile('keystone.jpeg') },
    query: `
        id
        secretFile {
          filename
          __typename
          filesize
          url
        }
    `,
  })

{
  const { storage, files } = inMemoryStorageStrategy()

  test(
    'upload works',
    getRunner({ storage })(async ({ context }) => {
      const data = await createItem(context)
      expect(data).toEqual({
        id: expect.any(String),
        secretFile: {
          url: `http://localhost:3000/files/${data.secretFile.filename}`,
          filename: expect.stringMatching(/^keystone-[A-Za-z0-9_-]{22}\.jpeg$/),
          __typename: 'FileFieldOutput',
          filesize: 3250,
        },
      })
      expect(files).toEqual(
        new Map([[data.secretFile.filename, await readTestFile('keystone.jpeg')]])
      )
    })
  )
}

{
  const { storage, files } = inMemoryStorageStrategy()
  test(
    'delete is called afterOperation',
    getRunner({
      storage,
    })(async ({ context }) => {
      const {
        id,
        secretFile: { filename },
      } = await createItem(context)

      expect(files).toEqual(new Map([[filename, await readTestFile('keystone.jpeg')]]))

      const {
        secretFile: { filename: filename2 },
      } = await context.query.Test.updateOne({
        where: { id },
        data: { secretFile: prepareTestFile('thinkmill.jpg') },
        query: `secretFile { filename }`,
      })

      expect(files).toEqual(new Map([[filename2, await readTestFile('thinkmill.jpg')]]))

      await context.query.Test.deleteOne({ where: { id } })

      expect(files).toEqual(new Map())
    })
  )
}

{
  const { storage, files } = noopStorageStrategy()
  test(
    'large file',
    getRunner({
      storage,
    })(async ({ context }) => {
      const chunkSize = 1024 * 1024
      const chunks = 2000
      // ~2GB
      const totalBytes = chunkSize * chunks

      const streamOfRandomData = () =>
        Readable.from(
          (async function* () {
            for (let i = 0; i < chunks; i++) {
              expect([...files.values()]).toEqual([
                { state: 'uploading', bytesSeen: i * chunkSize },
              ])
              yield randomBytes(chunkSize)
              await new Promise(resolve => setTimeout(resolve, 1))
            }
          })()
        )

      const upload = new Upload()
      upload.resolve({
        createReadStream: streamOfRandomData,
        filename: 'something',
        mimetype: 'application/octet-stream',
      })
      const item = await context.query.Test.createOne({
        data: { secretFile: { upload } },
        query: `
            id
            secretFile {
              filename
            }
        `,
      })

      expect(files).toEqual(
        new Map([[item.secretFile.filename, { state: 'done', bytesSeen: totalBytes }]])
      )
    })
  )
}

{
  const files = new Map<string, Uint8Array>()
  const storage: StorageStrategy<BaseKeystoneTypeInfo> = {
    async put(key, stream, meta) {
      files.set(key, await collectStream(stream))
    },
    async delete(key) {
      if (!files.has(key)) throw new Error(`${key} does not exist`)
      files.delete(key)
    },
    url(key) {
      return 'http://localhost:3000/files/' + key
    },
  }

  test(
    'setting to the same filename',
    getRunner({
      storage,
      transformName: () => 'something',
    })(async ({ context }) => {
      const item = await context.query.Test.createOne({
        data: { secretFile: prepareTestFile('keystone.jpg') },
        query: `
            id
            secretFile {
              filename
            }
        `,
      })

      expect(item).toEqual({
        id: expect.any(String),
        secretFile: {
          filename: 'something',
        },
      })

      expect(files).toEqual(new Map([['something', await readTestFile('keystone.jpg')]]))

      await context.query.Test.updateOne({
        where: { id: item.id },
        data: { secretFile: prepareTestFile('graphql.jpg') },
        query: `secretFile { filename }`,
      })
      expect(files).toEqual(new Map([['something', await readTestFile('graphql.jpg')]]))
    })
  )
}

{
  const { storage, files } = inMemoryStorageStrategy()
  test(
    "failing to upload a file doesn't delete the old file",
    getRunner({
      storage,
      transformName: originalFilename => {
        if (originalFilename === 'graphql.jpg') {
          throw new Error('upload failed')
        }
        return 'something'
      },
    })(async ({ context }) => {
      const item = await context.query.Test.createOne({
        data: { secretFile: prepareTestFile('keystone.jpg') },
        query: `
            id
            secretFile {
              filename
            }
        `,
      })

      expect(item).toEqual({
        id: expect.any(String),
        secretFile: {
          filename: 'something',
        },
      })

      expect(files).toEqual(new Map([['something', await readTestFile('keystone.jpg')]]))

      try {
        await context.query.Test.updateOne({
          where: { id: item.id },
          data: { secretFile: prepareTestFile('graphql.jpg') },
          query: `secretFile { filename }`,
        })
        expect(true).toBe(false)
      } catch (err: any) {
        expect(err.message).toBe(`An error occurred while resolving input fields.
  - Test.secretFile: upload failed`)
      }

      expect(files).toEqual(new Map([['something', await readTestFile('keystone.jpg')]]))
    })
  )
}
