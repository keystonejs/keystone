import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3, GetObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

import type { StorageConfig } from '../../types'
import type { FileAdapter, ImageAdapter } from './types'
import { Writable } from 'stream'

export function s3ImageAssetsAPI(storageConfig: StorageConfig & { kind: 's3' }, storageKey: string=''): ImageAdapter {
  const { generateUrl, s3, presign, s3Endpoint } = s3AssetsCommon(storageConfig)
  return {
    async url(id, extension) {
      if(storageConfig.serverRoute) {
        return generateUrl(`${storageConfig.serverRoute.path}/${storageKey}/${storageConfig.pathPrefix || ''}${id}.${extension}`);
      }

      if (!storageConfig.signed) {
        return generateUrl(`${s3Endpoint}${storageConfig.pathPrefix || ''}${id}.${extension}`)
      }

      return generateUrl(await presign(`${id}.${extension}`))
    },
    async upload(buffer, id, extension) {
      const upload = new Upload({
        client: s3,
        params: {
          Bucket: storageConfig.bucketName,
          Key: `${storageConfig.pathPrefix || ''}${id}.${extension}`,
          Body: buffer,
          ContentType: {
            png: 'image/png',
            webp: 'image/webp',
            gif: 'image/gif',
            jpg: 'image/jpeg'
          }[extension],
          ACL: storageConfig.acl,
        },
      })
      await upload.done()
    },
    async delete(id, extension) {
      await s3.deleteObject({
        Bucket: storageConfig.bucketName,
        Key: `${storageConfig.pathPrefix || ''}${id}.${extension}`,
      })
    },
    download: downloadFn(storageConfig)
  }
}

export function s3FileAssetsAPI(storageConfig: StorageConfig & { kind: 's3' }, storageKey: string=''): FileAdapter {
  const { generateUrl, s3, presign, s3Endpoint } = s3AssetsCommon(storageConfig)

  return {
    async url(filename) {
      if(storageConfig.serverRoute) {
        return generateUrl(`${storageConfig.serverRoute.path}/${storageKey}/${storageConfig.pathPrefix || ''}${filename}`);
      }
      if (!storageConfig.signed) {
        return generateUrl(`${s3Endpoint}${storageConfig.pathPrefix || ''}${filename}`)
      }
      return generateUrl(await presign(filename))
    },
    async upload(stream, filename) {
      let filesize = 0
      stream.on('data', data => {
        filesize += data.length
      })

      const upload = new Upload({
        client: s3,
        params: {
          Bucket: storageConfig.bucketName,
          Key: (storageConfig.pathPrefix || '') + filename,
          Body: stream,
          ContentType: 'application/octet-stream',
          ACL: storageConfig.acl,
        },
      })

      await upload.done()

      return { filename, filesize }
    },
    async delete(filename) {
      await s3.deleteObject({
        Bucket: storageConfig.bucketName,
        Key: (storageConfig.pathPrefix || '') + filename,
      })
    },
    download: downloadFn(storageConfig)
  }
}

export function getS3AssetsEndpoint(storageConfig: StorageConfig & { kind: 's3' }) {
  let endpoint = storageConfig.endpoint
    ? new URL(storageConfig.endpoint)
    : new URL(`https://s3.${storageConfig.region}.amazonaws.com`)
  if (storageConfig.forcePathStyle) {
    endpoint = new URL(`/${storageConfig.bucketName}`, endpoint)
  } else {
    endpoint.hostname = `${storageConfig.bucketName}.${endpoint.hostname}`
  }

  const endpointString = endpoint.toString()
  if (endpointString.endsWith('/')) return endpointString
  return `${endpointString}/`
}

export function s3AssetsCommon(storageConfig: StorageConfig & { kind: 's3' }) {
  const s3 = new S3({
    credentials:
      storageConfig.accessKeyId && storageConfig.secretAccessKey
        ? {
          accessKeyId: storageConfig.accessKeyId,
          secretAccessKey: storageConfig.secretAccessKey,
        }
        : undefined,
    region: storageConfig.region,
    endpoint: storageConfig.endpoint,
    forcePathStyle: storageConfig.forcePathStyle,
  })

  const s3Endpoint = getS3AssetsEndpoint(storageConfig)
  const generateUrl = storageConfig.generateUrl ?? (url => url)

  return {
    generateUrl,
    s3,
    s3Endpoint,
    presign: async (filename: string) => {
      const command = new GetObjectCommand({
        Bucket: storageConfig.bucketName,
        Key: (storageConfig.pathPrefix || '') + filename,
      })
      return getSignedUrl(s3, command, {
        expiresIn: storageConfig.signed?.expiry,
      })
    },
  }
}

const downloadFn = (storageConfig: StorageConfig & { kind: 's3' }) => {
  return async (filename: string, stream: Writable, headers: (key: string, val: string) => void) => {
    const { s3 } = s3AssetsCommon(storageConfig)
    console.log({headers,stream});
    const command = new GetObjectCommand({
      Bucket: storageConfig.bucketName,
      Key: filename,
    })

    const s3Response = await s3.send(command)
    if (!s3Response.Body) {
      throw new Error('No response body')
    }

    headers('Content-Type', s3Response.ContentType ?? '')
    headers('Content-Length', s3Response.ContentLength?.toString() ?? '')

    await s3Response.Body.transformToWebStream().pipeTo(Writable.toWeb(stream))
  };
}