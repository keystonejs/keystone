import path from 'path';
import { v4 as uuid } from 'uuid';
import fs from 'fs-extra';
import fromBuffer from 'image-type';
import imageSize from 'image-size';
import { KeystoneConfig, ImageMetadata, ImagesContext } from '../../types';
import { parseImageRef } from '../../fields/types/image/utils';
import { CloudAssetsAPI } from '../cloud/assets';
import { s3Assets } from '../s3/assets';

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
  cloudAssets: () => CloudAssetsAPI
): ImagesContext | undefined {
  if (!config.images) {
    return;
  }

  const { images } = config;
  const { s3 } = config.experimental || {};
  const { baseUrl = DEFAULT_BASE_URL, storagePath = DEFAULT_IMAGES_STORAGE_PATH } =
    images.local || {};

  if (images.upload === 'local') {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  return {
    getUrl: async (mode, id, extension) => {
      switch (mode) {
        case 'cloud': {
          return cloudAssets().images.url(id, extension);
        }
        case 's3': {
          return s3Assets(s3).images.url(id, extension);
        }
        case 'local': {
          const filename = `${id}.${extension}`;
          return `${baseUrl}/${filename}`;
        }
      }
    },
    getDataFromRef: async ref => {
      const imageRef = parseImageRef(ref);

      if (!imageRef) {
        throw new Error('Invalid image reference');
      }

      const { mode } = imageRef;

      switch (mode) {
        case 'cloud': {
          const metadata = await cloudAssets().images.metadata(imageRef.id, imageRef.extension);
          return { ...imageRef, ...metadata };
        }
        case 's3': {
          const metadata = await s3Assets(s3).images.metadata(imageRef.id, imageRef.extension);
          return { ...imageRef, ...metadata };
        }
        case 'local': {
          const buffer = await fs.readFile(
            path.join(storagePath, `${imageRef.id}.${imageRef.extension}`)
          );
          const metadata = getImageMetadataFromBuffer(buffer);

          return { ...imageRef, ...metadata };
        }
      }
    },
    getDataFromStream: async stream => {
      const { upload: mode } = images;
      const id = uuid();

      switch (mode) {
        case 'cloud': {
          const metadata = await cloudAssets().images.upload(stream, id);
          return { mode, id, ...metadata };
        }
        case 's3': {
          const metadata = await s3Assets(s3).images.upload(stream, id);
          return { mode, id, ...metadata };
        }
        case 'local': {
          const chunks = [];

          for await (let chunk of stream) {
            chunks.push(chunk);
          }

          const buffer = Buffer.concat(chunks);
          const metadata = getImageMetadataFromBuffer(buffer);

          await fs.writeFile(path.join(storagePath, `${id}.${metadata.extension}`), buffer);
          return { mode, id, ...metadata };
        }
      }
    },
  };
}
