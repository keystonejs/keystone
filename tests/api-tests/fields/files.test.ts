import { file, text } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import {
  noopStorageStrategy,
  inMemoryStorageStrategy,
  prepareTestFile,
  readTestFile,
} from './storage-utils'
import { Readable } from 'node:stream'
// @ts-expect-error
import Upload from 'graphql-upload/Upload.js'
import { randomBytes } from 'node:crypto'

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
  jest.setTimeout(10000)
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
