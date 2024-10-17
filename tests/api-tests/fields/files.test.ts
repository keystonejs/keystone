import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import fetch from 'node-fetch'
// @ts-expect-error
import Upload from 'graphql-upload/Upload.js'
import mime from 'mime'
import { file, text } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { type KeystoneConfig, type StorageConfig } from '@keystone-6/core/types'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'

const fieldPath = path.resolve(__dirname, './', 'types/fixtures')

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
    config: {
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
    },
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

describe('File - Crud special tests', () => {
  const filename = 'keystone.jpeg'
  const fileHash = createHash('sha1')
    .update(fs.readFileSync(path.resolve(fieldPath, 'image/test-files', filename)))
    .digest('hex')

  const createItem = (context: any) =>
    context.query.Test.createOne({
      data: { secretFile: prepareFile(filename, 'image') },
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

  for (const matrixValue of testMatrix) {
    const getConfig = (): StorageConfig => ({
      ...(matrixValue === 's3'
        ? { ...s3DefaultStorage, preserve: false, type: 'file' }
        : {
            kind: 'local',
            type: 'file',
            storagePath: fs.mkdtempSync(path.join(os.tmpdir(), 'file-local-test')),
            serverRoute: { path: '/files' },
            generateUrl: (path: string) => `http://localhost:3000/files${path}`,
          }),
    })

    const fields = { secretFile: file({ storage: 'test_file' }) }

    describe(matrixValue, () => {
      describe('Create - upload', () => {
        const config = getConfig()
        const hashConfig: { matrixValue: 'local', folder: string } | { matrixValue: 's3' } =
          config.kind === 'local'
            ? { matrixValue: 'local', folder: `${config.storagePath}/`! }
            : { matrixValue: config.kind }
        test(
          'Upload values should match expected corrected',
          getRunner({ storage: { test_file: { ...config } }, fields })(async ({ context }) => {
            const data = await createItem(context)
            expect(data).not.toBe(null)

            expect(data.secretFile).toEqual({
              /*
                The url and filename here include a hash, and currently what we are doing
                is just checking the url is modified correctly - that said, this sucks
                as a test
                */
              url:
                matrixValue === 's3'
                  ? expect.stringContaining(`/${data.secretFile.filename}`)
                  : `http://localhost:3000/files/${data.secretFile.filename}`,
              filename: data.secretFile.filename,
              __typename: 'FileFieldOutput',
              filesize: 3250,
            })
            // check file exists at location
            expect(fileHash).toEqual(await getFileHash(data.secretFile.filename, hashConfig))
          })
        )
      })

      describe('After Operation Hook', () => {
        const config = getConfig()
        const hashConfig =
          config.kind === 'local'
            ? { matrixValue: config.kind, folder: `${config.storagePath}/`! }
            : { matrixValue: config.kind }
        test(
          'with preserve: true',
          getRunner({ storage: { test_file: { ...config, preserve: true } }, fields })(
            async ({ context }) => {
              const {
                id,
                secretFile: { filename },
              } = await createItem(context)

              expect(await checkFile(filename, hashConfig)).toBeTruthy()

              const {
                secretFile: { filename: filename2 },
              } = await context.query.Test.updateOne({
                where: { id },
                data: { secretFile: prepareFile('thinkmill.jpg', 'file') },
                query: `secretFile { filename }`,
              })

              expect(await checkFile(filename, hashConfig)).toBeTruthy()
              expect(await checkFile(filename2, hashConfig)).toBeTruthy()

              await context.query.Test.deleteOne({ where: { id } })

              expect(await checkFile(filename, hashConfig)).toBeTruthy()
              // TODO test that just nulling the field doesn't delete it
            }
          )
        )
        test(
          'with preserve: false',
          getRunner({
            storage: { test_file: { ...config, preserve: false } },
            fields,
          })(async ({ context }) => {
            const {
              id,
              secretFile: { filename },
            } = await createItem(context)

            expect(await checkFile(filename, hashConfig)).toBeTruthy()

            const {
              secretFile: { filename: filename2 },
            } = await context.query.Test.updateOne({
              where: { id },
              data: { secretFile: prepareFile('thinkmill.jpg', 'file') },
              query: `
                secretFile {
                  filename
                }`,
            })

            expect(await checkFile(filename2, hashConfig)).toBeTruthy()
            expect(await checkFile(filename, hashConfig)).toBeFalsy()

            await context.query.Test.deleteOne({ where: { id } })

            expect(await checkFile(filename2, hashConfig)).toBeFalsy()

            // TODO test that just nulling the field removes the file
          })
        )
      })
    })
  }
})
