import path from 'path'
import os from 'os'
import fs from 'fs-extra'
// @ts-expect-error
import Upload from 'graphql-upload/Upload.js'
import mime from 'mime'
import { file } from '@keystone-6/core/fields'
import { type KeystoneConfig } from '@keystone-6/core/types'

export const prepareFile = (_filePath: string) => {
  const filePath = path.resolve(`${__dirname}/test-files/${_filePath}`)
  const upload = new Upload()
  upload.resolve({
    createReadStream: () => fs.createReadStream(filePath),
    filename: path.basename(filePath),
    mimetype: mime.getType(filePath),
    encoding: 'utf-8',
  })
  return { upload }
}

export const testMatrix: Array<MatrixValue> = ['local']

if (process.env.S3_BUCKET_NAME) {
  testMatrix.push('s3')
}

export const TEMP_STORAGE = fs.mkdtempSync(path.join(os.tmpdir(), 'tmp_test_images'))

export const getRootConfig = (matrixValue: MatrixValue): Partial<KeystoneConfig> => {
  if (matrixValue === 'local') {
    return {
      storage: {
        test_file: {
          kind: 'local',
          type: 'file',
          storagePath: TEMP_STORAGE,
          generateUrl: path => `http://localhost:3000/images${path}`,
          serverRoute: {
            path: '/images',
          },
        },
      },
    }
  }
  return {
    storage: {
      test_file: {
        kind: 's3',
        type: 'file',
        bucketName: process.env.S3_BUCKET_NAME!,
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        region: process.env.S3_REGION!,
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      },
    },
  }
}

export const name = 'File'
export const typeFunction = file

export const exampleValue = () => prepareFile('keystone.jpg')
export const exampleValue2 = () => prepareFile('react.jpg')
export const createReturnedValue = 3250
export const updateReturnedValue = 5562

export const supportsNullInput = true
export const supportsUnique = false
export const skipRequiredTest = true
export const fieldName = 'secretFile'
export const subfieldName = 'filesize'
export const fieldConfig = () => ({ storage: 'test_file' })

export type MatrixValue = 's3' | 'local'

export const getTestFields = () => ({
  secretFile: file({ storage: 'test_file' }),
})

export const initItems = () => [
  { secretFile: prepareFile('graphql.jpg'), name: 'file0' },
  { secretFile: prepareFile('keystone.jpg'), name: 'file1' },
  { secretFile: prepareFile('react.jpg'), name: 'file2' },
  { secretFile: prepareFile('thinkmill.jpg'), name: 'file3' },
  { secretFile: prepareFile('thinkmill1.jpg'), name: 'file4' },
  { secretFile: null, name: 'file5' },
  { secretFile: null, name: 'file6' },
]

export const storedValues = () => [
  { secretFile: { filesize: 2759 }, name: 'file0' },
  { secretFile: { filesize: 3250 }, name: 'file1' },
  { secretFile: { filesize: 5562 }, name: 'file2' },
  { secretFile: { filesize: 1028 }, name: 'file3' },
  { secretFile: { filesize: 1028 }, name: 'file4' },
  { secretFile: null, name: 'file5' },
  { secretFile: null, name: 'file6' },
]
