import { Readable } from 'stream';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  S3,
  // GetObjectCommand, PutObjectCommand
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

import { KeystoneConfig } from '../../types';
import { getImageMetadataFromBuffer } from './createImagesContext';
import { AssetsAPI } from './types';

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks = [];

  for await (let chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export function s3Assets(config: NonNullable<KeystoneConfig['storage']>): Map<string, AssetsAPI> {
  const assets = new Map<string, AssetsAPI>();

  for (let [storage, val] of Object.entries(config)) {
    if (val.kind === 's3') {
      const {
        bucketName,
        region,
        proxied: { baseUrl } = {},
        signed: { expiry } = {},
        forcePathStyle,
      } = val;

      const s3 = new S3({
        credentials: {
          accessKeyId: val.accessKeyId,
          secretAccessKey: val.secretAccessKey,
        },
        region,
        endpoint: val.endpoint,
        forcePathStyle,
      });

      let endpoint = val.endpoint
        ? new URL(val.endpoint)
        : new URL(`https://s3.${region}.amazonaws.com`);
      if (val.forcePathStyle) {
        endpoint = new URL(`/${val.bucketName}`, endpoint);
      } else {
        endpoint.hostname = `${val.bucketName}.${endpoint.hostname}`;
      }

      const endpointString = endpoint.toString();

      assets.set(storage, {
        images: {
          url(id, extension) {
            if (baseUrl && expiry) {
              // https://localhost:9000/images/...?signature=Cx19AOIRmbGI7ACGsnikhQ
              return endpointString.replace(/\/?$/, `/${id}.${extension}`);
            } else if (baseUrl) {
              return baseUrl.replace(/\/?$/, `/${id}.${extension}`);
              // https://localhost:9000/images/...
              return endpointString.replace(/\/?$/, `/${id}.${extension}`);
            } else if (expiry) {
              // https://my_images.s3.amazonaws.com/...?signature=Cx19AOIRmbGI7ACGsnikhQ
              return endpointString.replace(/\/?$/, `/${id}.${extension}`);
            } else {
              // https://my_images.s3.amazonaws.com/...
              return endpointString.replace(/\/?$/, `/${id}.${extension}`);
            }
          },
          async upload(stream, id) {
            const buffer = await streamToBuffer(stream);
            const metadata = getImageMetadataFromBuffer(buffer);

            const upload = new Upload({
              client: s3,
              params: {
                Bucket: bucketName,
                Key: `${id}.${metadata.extension}`,
                Body: buffer,
                ContentType: {
                  png: 'image/png',
                  webp: 'image/webp',
                  gif: 'image/gif',
                  jpg: 'image/jpeg',
                }[metadata.extension],
              },
            });
            await upload.done();

            return metadata;
          },
          async delete(id, extension) {
            s3.deleteObject({ Bucket: bucketName, Key: `${id}.${extension}` });
          },
        },
        files: {
          url(filename) {
            return endpointString.replace(/\/?$/, `/${filename}`);
          },
          async upload(stream, filename) {
            let filesize = 0;
            stream.on('data', data => {
              filesize += data.length;
            });

            const upload = new Upload({
              client: s3,
              params: {
                Bucket: bucketName,
                Key: filename,
                Body: stream,
              },
            });

            await upload.done();

            return { mode: 's3', filename, filesize, storage };
          },
          async delete(filename) {
            s3.deleteObject({ Bucket: bucketName, Key: filename });
          },
        },
      });
    }
  }

  return assets;
}
