import { Readable } from 'stream';
import { S3 } from '@aws-sdk/client-s3';
import { FileData, ImageExtension, ImageMetadata } from '../../types/context';
import { S3Config } from '../../types';
import { getImageMetadataFromBuffer } from '../context/createImagesContext';

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const data: Array<Uint8Array> = [];

    stream.on('data', chunk => {
      data.push(chunk);
    });

    stream.on('end', () => {
      resolve(Buffer.concat(data));
    });

    stream.on('error', err => {
      reject(err);
    });
  });
}

export type S3AssetsAPI = {
  images: {
    upload(stream: Readable, id: string): Promise<ImageMetadata>;
    url(id: string, extension: ImageExtension): string;
    metadata(id: string, extension: ImageExtension): Promise<ImageMetadata>;
  };
  files: {
    upload(stream: Readable, filename: string): Promise<FileData>;
    url(filename: string): string;
    metadata(filename: string): Promise<FileData>;
  };
};

export function s3Assets(config: S3Config | undefined): S3AssetsAPI {
  if (!config) {
    throw new Error('S3 config missing, please check your Keystone.ts file');
  }

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

  return {
    images: {
      url(id, extension) {
        const url = new URL(`/${id}.${extension}`, endpoint);
        return url.toString();
      },
      async metadata(id, extension): Promise<ImageMetadata> {
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

        await s3.putObject({
          Bucket: bucketName,
          Key: `${id}.${metadata.extension}`,
          Body: buffer,
          Metadata: {
            width: String(metadata.width),
            height: String(metadata.height),
          },
        });

        return metadata;
      },
    },
    files: {
      url(filename) {
        const url = new URL(`/${filename}`, endpoint);
        return url.toString();
      },
      async metadata(filename) {
        const { ContentLength } = await s3.headObject({
          Bucket: bucketName,
          Key: filename,
        });

        if (ContentLength === undefined) {
          throw new Error('File metadata not found');
        }

        return {
          mode: 's3',
          filesize: ContentLength,
          filename,
        };
      },
      async upload(stream, filename) {
        const buffer = await streamToBuffer(stream);

        await s3.putObject({
          Bucket: bucketName,
          Key: filename,
          Body: buffer,
        });

        return {
          mode: 's3',
          filename,
          filesize: buffer.length,
        };
      },
    },
  };
}
