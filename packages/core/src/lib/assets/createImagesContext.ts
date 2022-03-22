import path from 'path';
import { v4 as uuid } from 'uuid';
import fs from 'fs-extra';
import fromBuffer from 'image-type';
import imageSize from 'image-size';
import { KeystoneConfig, ImageMetadata, ImagesContext } from '../../types';
import { AssetsAPI } from './types';
const DEFAULT_BASE_URL = '/images';
export const DEFAULT_IMAGES_STORAGE_PATH = './public/images';

export function getImageMetadataFromBuffer(buffer: Buffer): ImageMetadata {
  const fileType = fromBuffer(buffer);
  if (!fileType) {
    throw new Error('File type not found');
  }

  const extension = fileType.ext;
  if (extension !== 'jpg' && extension !== 'png' && extension !== 'webp' && extension !== 'gif') {
    throw new Error(`${extension} is not a supported image type`);
  }

  const { height, width } = imageSize(buffer);

  if (width === undefined || height === undefined) {
    throw new Error('Height and width could not be found for image');
  }
  return { width, height, filesize: buffer.length, extension };
}

export function createImagesContext(
  config: KeystoneConfig,
  s3Assets: () => Map<string, AssetsAPI>
): ImagesContext | undefined {
  if (!config.storage) {
    return;
  }

  const { storage } = config;

  Object.entries(storage).forEach(([, val]) => {
    if (val.type === 'image' && val.kind === 'local') {
      fs.mkdirSync(val.storagePath || DEFAULT_IMAGES_STORAGE_PATH, { recursive: true });
    }
  });

  return {
    getUrl: async (storageString, id, extension) => {
      let storageConfig = config.storage?.[storageString];

      switch (storageConfig?.kind) {
        case 's3': {
          const s3Instance = s3Assets().get(storageString);

          if (!s3Instance) {
            throw new Error(`Keystone has no connection to S3 storage location ${storageString}`);
          }

          return s3Instance.images.url(id, extension);
        }
        case 'local': {
          const filename = `${id}.${extension}`;
          return `${storageConfig.baseUrl || DEFAULT_BASE_URL}/${filename}`;
        }
      }

      throw new Error(
        `attempted to get URL for storage ${storageString}, however could not find the config for it`
      );
    },
    getDataFromStream: async (storage, stream) => {
      const storageConfig = config.storage?.[storage];

      const id = uuid();

      switch (storageConfig?.kind) {
        case 's3': {
          const s3Instance = s3Assets().get(storage);

          if (!s3Instance) {
            throw new Error(`Keystone has no connection to S3 storage location ${storage}`);
          }

          const metadata = await s3Instance.images.upload(stream, id);
          return { storage, id, ...metadata };
        }
        case 'local': {
          const chunks = [];

          for await (let chunk of stream) {
            chunks.push(chunk);
          }

          const buffer = Buffer.concat(chunks);
          const metadata = getImageMetadataFromBuffer(buffer);

          await fs.writeFile(
            path.join(
              storageConfig.storagePath || DEFAULT_IMAGES_STORAGE_PATH,
              `${id}.${metadata.extension}`
            ),
            buffer
          );
          return { storage, id, ...metadata };
        }
      }

      throw new Error(
        `attempted to get data from stream for storage ${storageConfig}, however could not find the config for it`
      );
    },
    deleteAtSource: async (storageString, id, extension) => {
      let storageConfig = config.storage?.[storageString];

      switch (storageConfig?.kind) {
        case 's3': {
          const s3Instance = s3Assets().get(storageString);

          await s3Instance?.images.delete(id, extension);
        }
        case 'local': {
          await fs.remove(
            // TODO: find out why this isn't narrowing
            path.join(
              storageConfig.storagePath || DEFAULT_IMAGES_STORAGE_PATH,
              `${id}.${extension}`
            )
          );
        }
      }
    },
  };
}
