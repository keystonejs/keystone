import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, image, file } from '@keystone-6/core/fields'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3, GetObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

import type { Lists } from '.keystone/types'

const {
  S3_BUCKET_NAME: bucketName = 'keystone-test',
  S3_PUBLIC_ENDPOINT: publicEndpoint = `https://${bucketName}.s3.amazonaws.com`,
  S3_PRIVATE_BUCKET_NAME: privateBucketName = 'keystone-test-private',
  S3_REGION: region = 'ap-southeast-2',
  S3_ACCESS_KEY_ID: accessKeyId = 'keystone',
  S3_SECRET_ACCESS_KEY: secretAccessKey = 'keystone',
  S3_ENDPOINT: endpoint,
} = process.env

const s3 = new S3({ endpoint, region, credentials: { accessKeyId, secretAccessKey } })

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text(),
      banner: image({
        storage: {
          async put(key, stream, meta) {
            const upload = new Upload({
              client: s3,
              params: { Bucket: bucketName, Key: key, Body: stream, ContentType: meta.contentType },
            })
            await upload.done()
          },
          async delete(key) {
            await s3.deleteObject({
              Bucket: bucketName,
              Key: key,
            })
          },
          url(key) {
            return `${publicEndpoint}/${key}`
          },
        },
      }),
      attachment: file({
        storage: {
          async put(key, stream, meta) {
            const upload = new Upload({
              client: s3,
              params: {
                Bucket: privateBucketName,
                Key: key,
                Body: stream,
                ContentType: meta.contentType,
              },
            })
            await upload.done()
          },
          async delete(key) {
            await s3.deleteObject({
              Bucket: privateBucketName,
              Key: key,
            })
          },
          url(key) {
            return getSignedUrl(s3, new GetObjectCommand({ Bucket: privateBucketName, Key: key }))
          },
        },
      }),
    },
  }),
} satisfies Lists
