import path from 'path';
import { v4 as uuid } from 'uuid';
import fs from 'fs-extra';
import fromBuffer from 'image-type';
import imageSize from 'image-size';
import { KeystoneConfig, ImagesContext, ImageMetadata } from '../../types';
import { parseImageRef } from '../../fields/types/image/utils';
import {
  buildKeystoneCloudImageSrc,
  getImageMetadataFromKeystoneCloud,
  uploadImageToKeystoneCloud,
} from '../keystone-cloud/assets';

const DEFAULT_BASE_URL = '/images';
const DEFAULT_STORAGE_PATH = './public/images';

const getImageMetadataFromBuffer = async (buffer: Buffer): Promise<ImageMetadata> => {
  const filesize = buffer.length;
  const fileType = fromBuffer(buffer);
  if (!fileType) {
    throw new Error('File type not found');
  }

  const extension = fileType.ext;
  if (
    extension !== 'jpg' &&
    extension !== 'png' &&
    extension !== 'webp' &&
    extension !== 'gif'
  ) {
    throw new Error(`${extension} is not a supported image type`);
  }

  const { height, width } = imageSize(buffer);

  if (width === undefined || height === undefined) {
    throw new Error('Height and width could not be found for image');
  }
  return { width, height, filesize, extension };
};

// TODO: get the cloudConfiguration into here
export function createImagesContext(config: KeystoneConfig): ImagesContext | undefined {
  if (!config.images) {
    return;
  }

  const { images, experimental } = config;
  const { baseUrl = DEFAULT_BASE_URL, storagePath = DEFAULT_STORAGE_PATH } = images.local || {};
  const {
    apiKey = '',
    imagesDomain = '',
    restApiEndpoint = '',
  } = experimental?.keystoneCloud || {};

  if (images.upload === 'local') {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  return {
    getSrc: async (mode, id, extension) => {
      const filename = `${id}.${extension}`;

      if (mode === 'cloud') {
        return await buildKeystoneCloudImageSrc({
          apiKey,
          imagesDomain,
          filename,
        });
      }

      return `${baseUrl}/${filename}`;
    },
    getDataFromRef: async ref => {
      const imageRef = parseImageRef(ref);

      if (!imageRef) {
        throw new Error('Invalid image reference');
      }

      const { mode } = imageRef;

      if (mode === 'cloud') {
        const { id, extension } = imageRef;
        const filename = `${id}.${extension}`;
        const metadata = await getImageMetadataFromKeystoneCloud({
          filename,
          apiKey,
          restApiEndpoint,
        });

        return { ...imageRef, ...metadata };
      }

      const buffer = await fs.readFile(
        path.join(storagePath, `${imageRef.id}.${imageRef.extension}`)
      );
      const metadata = await getImageMetadataFromBuffer(buffer);

      return { ...imageRef, ...metadata };
    },
    getDataFromStream: async stream => {
      const { upload: mode } = images;
      const id = uuid();

      if (mode === 'cloud') {
        const metadata = await uploadImageToKeystoneCloud({
          apiKey,
          stream,
          restApiEndpoint,
          filename: id,
        });

        return { mode, id, ...metadata };
      }

      const chunks = [];

      for await (let chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      const metadata = await getImageMetadataFromBuffer(buffer);

      await fs.writeFile(path.join(storagePath, `${id}.${metadata.extension}`), buffer);

      return { mode, id, ...metadata };
    },
  };
}
