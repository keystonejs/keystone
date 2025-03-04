import { file, text } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import { inMemoryStorageAdapter, prepareTestFile, readTestFile } from './storage-utils'

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
  const { storage, files } = inMemoryStorageAdapter()

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
  const { storage, files } = inMemoryStorageAdapter()
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
