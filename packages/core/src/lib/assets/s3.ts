import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3, S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

import { KeystoneConfig } from '../../types';
import { getImageMetadataFromBuffer } from './createImagesContext';
import { FileAdapter, ImageAdapter } from './types';
import { streamToBuffer } from './utils';

export function s3ImageAssetsAPI(storageConfig: StorageConfig & { kind: 's3' }): ImageAdapter {
  const { generateUrl, s3, presign } = s3AssetsCommon(storageConfig);
  return {
    async url(id, extension) {
      if (!storageConfig.signed) return generateUrl(`/${id}.${extension}`);
      return presign(`${id}.${extension}`);
    },
    async upload(stream, id) {
      const buffer = await streamToBuffer(stream);
      const metadata = getImageMetadataFromBuffer(buffer);

      const upload = new Upload({
        client: s3,
        params: {
          Bucket: storageConfig.bucketName,
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
      s3.deleteObject({ Bucket: storageConfig.bucketName, Key: `${id}.${extension}` });
    },
  };
}

export function s3FileAssetsAPI(storageConfig: StorageConfig & { kind: 's3' }): FileAdapter {
  const { generateUrl, s3, presign } = s3AssetsCommon(storageConfig);

  return {
    async url(filename) {
      if (!storageConfig.signed) return generateUrl(`/${filename}`);
      return presign(filename);
    },
    async upload(stream, filename) {
      let filesize = 0;
      stream.on('data', data => {
        filesize += data.length;
      });

      const upload = new Upload({
        client: s3,
        params: {
          Bucket: storageConfig.bucketName,
          Key: filename,
          Body: stream,
        },
      });

export function s3Assets(config: NonNullable<KeystoneConfig['storage']>): Map<string, AssetsAPI> {
  const assets = new Map<string, AssetsAPI>();

  for (let [storage, val] of Object.entries(config)) {
    if (val.kind === 's3') {
      const { bucketName, region } = val;

      const s3 = new S3({
        credentials: {
          accessKeyId: val.accessKeyId,
          secretAccessKey: val.secretAccessKey,
        },
        region,
        endpoint: val.endpoint,
        forcePathStyle: val.forcePathStyle,
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
            return endpointString.replace(/\/?$/, `/${id}.${extension}`);
          },
          async metadata(id, extension) {
            const { Body } = await s3.getObject({ Bucket: bucketName, Key: `${id}.${extension}` });

            const buffer = await streamToBuffer(Body as Readable);

            const { height, width } = imageSize(buffer);

            if (width === undefined || height === undefined) {
              throw new Error('Height and width could not be found for image');
            }
            return { extension, height, width, filesize: buffer.length };
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
        },
        files: {
          url(filename) {
            return endpointString.replace(/\/?$/, `/${filename}`);
          },
          async metadata(filename) {
            const { ContentLength } = await s3.headObject({
              Bucket: bucketName,
              Key: filename,
            });

            if (ContentLength === undefined) {
              throw new Error('File metadata not found');
            }

            return { mode: 's3', filesize: ContentLength, filename, storage };
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
        },
      });
    }
  }

  return assets;
}
