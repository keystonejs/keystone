import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import fetch from 'node-fetch'

// @ts-expect-error
import Upload from 'graphql-upload/Upload.js'
import mime from 'mime'
import { text, image } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { type KeystoneConfig, type StorageConfig } from '@keystone-6/core/types'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import { expectSingleResolverError } from '../utils'

const fieldPath = path.resolve(__dirname, '../../..', 'packages/core/src/fields/types')

export function prepareFile (_filePath: string, kind: 'image' | 'file') {
  const filePath = path.resolve(fieldPath, kind, 'test-files', _filePath)
  const upload = new Upload()
  upload.resolve({
    createReadStream: () => fs.createReadStream(filePath),
    filename: path.basename(filePath),
    mimetype: mime.getType(filePath),
    encoding: 'utf-8',
  })
  return { upload }
}

type MatrixValue = 's3' | 'local'
export const testMatrix: Array<MatrixValue> = ['local']

if (process.env.S3_BUCKET_NAME) {
  testMatrix.push('s3')
}

const s3DefaultStorage = {
  kind: 's3',
  bucketName: process.env.S3_BUCKET_NAME!,
  accessKeyId: process.env.S3_ACCESS_KEY_ID!,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
} as const

function getRunner ({
  storage,
  fields,
}: {
  storage: Record<string, StorageConfig>
  fields: KeystoneConfig['lists'][string]['fields']
}) {
  return setupTestRunner({
    config: ({
      db: {},
      storage,
      lists: {
        Test: list({
          access: allowAll,
          fields: {
            name: text(),
            ...fields,
          },
        }),
      },
    }),
  })
}

function sha1 (x: Buffer) {
  return createHash('sha1').update(x).digest('hex')
}

async function getFileHash (
  url: string,
  config: { matrixValue: 's3' } | { matrixValue: 'local', folder: string }
) {
  if (config.matrixValue === 's3') {
    return sha1(await fetch(url).then(x => x.buffer()))
  }

  return sha1(await fsp.readFile(path.join(config.folder, url)))
}

async function checkFile (
  filename: string,
  config: { matrixValue: 's3' } | { matrixValue: 'local', folder: string }
) {
  if (config.matrixValue === 's3') return await fetch(filename).then(x => x.status === 200)
  return Boolean(await fsp.stat(path.join(config.folder, filename)).catch(() => null))
}

describe('Image - Crud special tests', () => {
  const createItem = async (context: any, filename: string) =>
    await context.query.Test.createOne({
      data: { avatar: prepareFile(filename, 'image') },
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

  for (const matrixValue of testMatrix) {
    const getConfig = (): StorageConfig => ({
      ...(matrixValue === 's3'
        ? { ...s3DefaultStorage, type: 'image', preserve: false }
        : {
            kind: 'local',
            type: 'image',
            storagePath: fs.mkdtempSync(path.join(os.tmpdir(), 'image-local-test')),
            serverRoute: { path: '/images' },
            generateUrl: (path: string) => `http://localhost:3000/images${path}`,
            preserve: false,
          }),
    })
    const fields = { avatar: image({ storage: 'test_image' }) }
    const config = getConfig()
    const hashConfig =
      config.kind === 'local'
        ? { matrixValue: config.kind, folder: `${config.storagePath}/`! }
        : { matrixValue: config.kind }

    describe(matrixValue, () => {
      describe('Create - upload', () => {
        for (const matrixValue of testMatrix) {
          test(
            'upload values should match expected',
            getRunner({ fields, storage: { test_image: config } })(async ({ context }) => {
              const filenames = ['keystone.jpg']
              for (const filename of filenames) {
                const fileHash = createHash('sha1')
                  .update(fs.readFileSync(path.resolve(fieldPath, 'image/test-files', filename)))
                  .digest('hex')

                const data = await createItem(context, filename)
                expect(data).not.toBe(null)

                expect(data.avatar).toEqual({
                  url:
                    matrixValue === 's3'
                      ? expect.stringContaining(`/${data.avatar.id}.jpg`)
                      : `http://localhost:3000/images/${data.avatar.id}.jpg`,
                  id: data.avatar.id,
                  __typename: 'ImageFieldOutput',
                  filesize: 3250,
                  width: 150,
                  height: 152,
                  extension: 'jpg',
                })

                expect(fileHash).toEqual(
                  await getFileHash(`${data.avatar.id}.${data.avatar.extension}`, hashConfig)
                )
              }
            })
          )
          test(
            'if not image file, throw',
            getRunner({ fields, storage: { test_image: config } })(async ({ context }) => {
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
                variables: { item: { avatar: prepareFile('badfile.txt', 'image') } },
              })
              expect(data).toEqual({ createTest: null })
              const message = `File type not found`
              expectSingleResolverError(errors, 'createTest', 'Test.avatar', message)
            })
          )

          describe('After Operation Hook', () => {
            test(
              'with preserve: true',
              getRunner({ fields, storage: { test_image: { ...config, preserve: true } } })(
                async ({ context }) => {
                  const ogFilename = 'keystone.jpeg'

                  const { id, avatar } = await createItem(context, ogFilename)

                  await context.query.Test.updateOne({
                    where: { id },
                    data: { avatar: prepareFile('thinkmill.jpg', 'image') },
                  })

                  expect(
                    await checkFile(`${avatar.id}.${avatar.extension}`, hashConfig)
                  ).toBeTruthy()

                  await context.query.Test.deleteOne({ where: { id } })

                  expect(
                    await checkFile(`${avatar.id}.${avatar.extension}`, hashConfig)
                  ).toBeTruthy()
                  // TODO test that just nulling the field doesn't delete it
                }
              )
            )

            test(
              'with preserve: false',
              getRunner({
                fields,
                storage: { test_image: { ...config, preserve: false } },
              })(async ({ context }) => {
                const ogFilename = 'keystone.jpeg'
                const { id, avatar } = await createItem(context, ogFilename)
                const filename = `${avatar.id}.${avatar.extension}`

                expect(await checkFile(filename, hashConfig)).toBeTruthy()
                const { avatar: avatar2 } = await context.query.Test.updateOne({
                  where: { id },
                  data: { avatar: prepareFile('thinkmill.jpg', 'image') },
                  query: `avatar {
                        id
                        extension
                      }`,
                })

                const filename2 = `${avatar2.id}.${avatar2.extension}`

                expect(await checkFile(filename, hashConfig)).toBeFalsy()
                expect(await checkFile(filename2, hashConfig)).toBeTruthy()

                await context.query.Test.deleteOne({ where: { id } })

                expect(await checkFile(filename2, hashConfig)).toBeFalsy()

                // TODO test that just nulling the field removes the file
              })
            )
          })
        }
      })
    })
  }
})
