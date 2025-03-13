import { text, image } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import { expectSingleResolverError } from '../utils'
import {
  collectStream,
  inMemoryStorageStrategy,
  noopStorageStrategy,
  prepareTestFile,
  readTestFile,
} from './storage-utils'
// @ts-expect-error
import Upload from 'graphql-upload/Upload.js'
import { Readable } from 'stream'
import { randomBytes } from 'crypto'
import type { BaseKeystoneTypeInfo, StorageStrategy } from '@keystone-6/core/types'

jest.setTimeout(10000)

function getRunner(args: Parameters<typeof image>[0]) {
  return setupTestRunner({
    config: {
      lists: {
        Test: list({
          access: allowAll,
          fields: {
            name: text(),
            avatar: image(args),
          },
        }),
      },
    },
  })
}

const createItem = async (context: any, filename: string) =>
  await context.query.Test.createOne({
    data: { avatar: prepareTestFile(filename) },
    query: `
      id
      avatar {
        __typename
        id
        filesize
        width
        height
        extension
        url
      }
    `,
  })

{
  const { storage, files } = inMemoryStorageStrategy()
  test(
    'upload values should match expected',
    getRunner({ storage })(async ({ context }) => {
      const filenames = ['keystone.jpg']
      for (const filename of filenames) {
        const data = await createItem(context, filename)

        expect(data).toEqual({
          id: expect.any(String),
          avatar: {
            url: `http://localhost:3000/files/${data.avatar.id}.jpg`,
            id: expect.stringMatching(/^[A-Za-z0-9_-]{22}$/),
            __typename: 'ImageFieldOutput',
            filesize: 3250,
            width: 150,
            height: 152,
            extension: 'jpg',
          },
        })

        expect(files).toEqual(new Map([[`${data.avatar.id}.jpg`, await readTestFile(filename)]]))
      }
    })
  )
}
{
  const { storage, files } = inMemoryStorageStrategy()
  test(
    'if not image file, throw',
    getRunner({ storage })(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: `
                    mutation ($item: TestCreateInput!) {
                        createTest(data: $item) {
                            avatar {
                                id
                            }
                        }
                    }
                `,
        variables: { item: { avatar: prepareTestFile('badfile.txt') } },
      })
      expect(data).toEqual({ createTest: null })
      const message = `File type not found`
      expectSingleResolverError(errors, 'createTest', 'Test.avatar', message)
      expect(files).toEqual(new Map())
    })
  )
}

{
  const { storage, files } = inMemoryStorageStrategy()
  test(
    'delete works',
    getRunner({ storage })(async ({ context }) => {
      const { id, avatar } = await createItem(context, 'keystone.jpeg')
      expect(files).toEqual(new Map([[`${avatar.id}.jpg`, await readTestFile('keystone.jpeg')]]))

      const updatedItem = await context.query.Test.updateOne({
        where: { id },
        data: { avatar: prepareTestFile('thinkmill.jpg') },
        query: 'avatar { id }',
      })
      expect(files).toEqual(
        new Map([[`${updatedItem.avatar.id}.jpg`, await readTestFile('thinkmill.jpg')]])
      )

      await context.query.Test.deleteOne({ where: { id } })
      expect(files).toEqual(new Map())
    })
  )
}

{
  const { storage, files } = noopStorageStrategy()
  test(
    'large file with header split into multiple chunks',
    getRunner({ storage })(async ({ context }) => {
      const image = new Uint8Array(await readTestFile('keystone.jpeg'))
      const upload = new Upload()
      const chunkSize = 1024 * 1024
      const chunks = 2000
      // ~2GB
      const totalBytes = chunkSize * chunks + image.byteLength
      expect(image.byteLength).toBeGreaterThan(1024)
      upload.resolve({
        createReadStream: () =>
          Readable.from(
            (async function* () {
              expect(files).toEqual(new Map())
              yield Buffer.from(image.slice(0, 100))
              await wait(1)
              expect(files).toEqual(new Map())
              yield Buffer.from(image.slice(100, 1024))
              await wait(1)
              expect([...files.values()]).toEqual([
                {
                  state: 'uploading',
                  bytesSeen: 1024,
                },
              ])
              yield Buffer.from(image.slice(1024))
              await wait(1)
              expect([...files.values()]).toEqual([
                {
                  state: 'uploading',
                  bytesSeen: image.byteLength,
                },
              ])
              for (let i = 0; i < chunks; i++) {
                expect([...files.values()]).toEqual([
                  { state: 'uploading', bytesSeen: image.byteLength + i * chunkSize },
                ])
                yield randomBytes(chunkSize)
                await wait(1)
              }
            })()
          ),
        filename: 'keystone.jpeg',
        mimetype: 'image/jpeg',
        encoding: 'utf-8',
      })

      const { id, avatar } = await context.query.Test.createOne({
        data: { avatar: { upload } },
        query: `
          id
          avatar {
            id
            extension
          }
        `,
      })
      expect(avatar.extension).toBe('jpg')
      expect(files).toEqual(
        new Map([[`${avatar.id}.jpg`, { state: 'done', bytesSeen: totalBytes }]])
      )

      await context.query.Test.deleteOne({ where: { id } })
      expect(files).toEqual(new Map())
    })
  )
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
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
        data: { avatar: prepareTestFile('keystone.jpg') },
        query: `
            id
            avatar {
              id
            }
        `,
      })

      expect(item).toEqual({
        id: expect.any(String),
        avatar: {
          id: 'something',
        },
      })

      expect(files).toEqual(new Map([['something.jpg', await readTestFile('keystone.jpg')]]))

      await context.query.Test.updateOne({
        where: { id: item.id },
        data: { avatar: prepareTestFile('graphql.jpg') },
      })
      expect(files).toEqual(new Map([['something.jpg', await readTestFile('graphql.jpg')]]))
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
        data: { avatar: prepareTestFile('keystone.jpg') },
        query: `
            id
            avatar {
              id
            }
        `,
      })

      expect(item).toEqual({
        id: expect.any(String),
        avatar: {
          id: 'something',
        },
      })

      expect(files).toEqual(new Map([['something.jpg', await readTestFile('keystone.jpg')]]))

      try {
        await context.query.Test.updateOne({
          where: { id: item.id },
          data: { avatar: prepareTestFile('graphql.jpg') },
        })
        expect(true).toBe(false)
      } catch (err: any) {
        expect(err.message).toBe(`An error occurred while resolving input fields.
  - Test.avatar: upload failed`)
      }

      expect(files).toEqual(new Map([['something.jpg', await readTestFile('keystone.jpg')]]))
    })
  )
}
