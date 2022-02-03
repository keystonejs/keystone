import { Readable } from 'stream';
import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { S3Config } from '../../types';
import { getImageMetadataFromBuffer } from './createImagesContext';
import { AssetsAPI } from './types';

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks = [];

  for await (let chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export function s3Assets(config: S3Config): AssetsAPI {
  const { bucketName, region } = config;
  const s3 = new S3({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
  });

  let endpoint = config.endpoint
    ? new URL(config.endpoint)
    : new URL(`https://s3.${region}.amazonaws.com`);
  if (config.forcePathStyle) {
    endpoint = new URL(`/${config.bucketName}`, endpoint);
  } else {
    endpoint.hostname = `${config.bucketName}.${endpoint.hostname}`;
  }

  const endpointString = endpoint.toString();

  return {
    images: {
      url(id, extension) {
        return endpointString.replace(/\/?$/, `/${id}.${extension}`);
      },
      async metadata(id, extension) {
        const { Metadata = {}, ContentLength } = await s3.headObject({
          Bucket: bucketName,
          Key: `${id}.${extension}`,
        });

        return {
          extension,
          height: Number(Metadata.height),
          width: Number(Metadata.width),
          filesize: ContentLength!,
        };
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
            Metadata: {
              width: String(metadata.width),
              height: String(metadata.height),
            },
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

        return { mode: 's3', filesize: ContentLength, filename };
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

        return { mode: 's3', filename, filesize };
      },
    },
  };
}
