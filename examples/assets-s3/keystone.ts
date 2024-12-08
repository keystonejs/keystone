import 'dotenv/config'
import { config } from '@keystone-6/core'
import { lists } from './schema'
import bytes from 'bytes'

const {
  S3_BUCKET_NAME: bucketName = 'keystone-test',
  S3_REGION: region = 'ap-southeast-2',
  S3_ACCESS_KEY_ID: accessKeyId = 'keystone',
  S3_SECRET_ACCESS_KEY: secretAccessKey = 'keystone',
} = process.env

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  lists,
  server: {
    maxFileSize: bytes('8Mb')
  },
  storage: {
    my_images: {
      kind: 's3',
      type: 'image',
      bucketName,
      region,
      accessKeyId,
      secretAccessKey,
      signed: { expiry: 5000 },
    },
    my_files: {
      kind: 's3',
      type: 'file',
      bucketName,
      region,
      accessKeyId,
      secretAccessKey,
      signed: { expiry: 5000 },
    },
  },
})
