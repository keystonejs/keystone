import { Readable } from 'stream';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { fileTypeFromStream } from 'file-type';
import sizeOf from 'image-size';
import { FileData, ImageExtension, ImageMetadata } from '../../types/context';
import { S3Config } from '../../types';

let s3Client: null | S3Client = null;

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

function getS3Client({ region, accessKeyId, secretAccessKey }: S3Config): S3Client {
  if (s3Client) {
    return s3Client;
  }

  s3Client = new S3Client({
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    region,
  });

  return s3Client;
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
  const s3 = getS3Client(config);

  return {
    images: {
      url(id, extension) {
        return region
          ? `https://${bucketName}.s3.${region}.amazonaws.com/${id}.${extension}`
          : `https://${bucketName}.s3.amazonaws.com/${id}.${extension}`;
      },
      async metadata(id, extension): Promise<ImageMetadata> {
        const getObjectCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: `${id}.${extension}`,
        });
        const { Metadata = {} } = await s3.send(getObjectCommand);

        return {
          extension: Metadata.extension as ImageExtension,
          height: Number(Metadata.height),
          width: Number(Metadata.width),
          filesize: Number(Metadata.filesize),
        };
      },
      async upload(stream, id) {
        const buffer = await streamToBuffer(stream);
        const fileType = await fileTypeFromStream(stream);
        const { width, height } = sizeOf(buffer);
        const filesize = buffer.length;

        if (!width || !height) {
          throw new Error('Unable to calculate dimensions of image');
        }

        if (!fileType) {
          throw new Error('Unable to determine image file extension');
        }

        const { ext: extension } = fileType;
        const metadata = {
          width: String(width),
          height: String(height),
          filesize: String(filesize),
          extension: extension as ImageExtension,
        };
        const uploadParams = {
          Bucket: bucketName,
          Key: `${id}.${fileType.ext}`,
          Body: stream,
          Metadata: metadata,
        };

        await s3.send(new PutObjectCommand(uploadParams));

        return {
          width: Number(width),
          height: Number(height),
          filesize: Number(filesize),
          extension: extension as ImageExtension,
        };
      },
    },
    files: {
      url(filename) {
        return region
          ? `https://${bucketName}.s3.${region}.amazonaws.com/${filename}`
          : `https://${bucketName}.s3.amazonaws.com/${filename}`;
      },
      async metadata(filename) {
        const getObjectCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: filename,
        });
        const { Metadata } = await s3.send(getObjectCommand);

        if (!Metadata) {
          throw new Error('File metadata not found');
        }

        return {
          mode: 's3',
          filesize: Number(Metadata.filesize),
          filename,
        };
      },
      async upload(stream, filename) {
        const buffer = await streamToBuffer(stream);
        const filesize = buffer.length;
        const mode = 's3';
        const metadata = {
          mode,
          filename,
          filesize: String(filesize),
        };
        const uploadParams = {
          Bucket: bucketName,
          Key: filename,
          Body: stream,
          Metadata: metadata,
        };

        await s3.send(new PutObjectCommand(uploadParams));

        return {
          mode,
          filename,
          filesize,
        };
      },
    },
  };
}
