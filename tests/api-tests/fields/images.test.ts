import { text, image } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import { expectSingleResolverError } from '../utils'
import { inMemoryStorageAdapter, prepareTestFile, readTestFile } from './storage-utils'

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
  const { storage, files } = inMemoryStorageAdapter()
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
  const { storage, files } = inMemoryStorageAdapter()
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
  const { storage, files } = inMemoryStorageAdapter()
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
