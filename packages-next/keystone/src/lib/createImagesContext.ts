import path from 'path';
import {
  ImagesConfig as KeystoneImagesConfig,
  ImagesContext,
  ImageExtension,
  ImageMode,
} from '@keystone-next/types';
import { v4 as uuid } from 'uuid';
import fs from 'fs-extra';
import { fromBuffer } from 'file-type';
import imageSize from 'image-size';

import { parseImageRef } from '@keystone-next/utils-legacy';

const DEFAULT_BASE_URL = '/images';
const DEFAULT_STORAGE_PATH = './public/images';

const getImageMetadataFromBuffer = async (buffer: Buffer) => {
  const filesize = buffer.length;
  const fileType = await fromBuffer(buffer);
  if (!fileType) {
    throw new Error('File type not found');
  }

  if (
    fileType.ext !== 'jpg' &&
    fileType.ext !== 'png' &&
    fileType.ext !== 'webp' &&
    fileType.ext !== 'gif'
  ) {
    throw new Error(`${fileType.ext} is not a supported image type`);
  }

  const extension: ImageExtension = fileType.ext;

  const { height, width } = imageSize(buffer);

  if (width === undefined || height === undefined) {
    throw new Error('Height and width could not be found for image');
  }
  return { width, height, filesize, extension };
};

const isLocal = (mode: ImageMode) => mode === 'local';

const isCloud = (mode: ImageMode) => mode !== 'local';

export function createImagesContext(config?: KeystoneImagesConfig): ImagesContext | undefined {
  if (!config) {
    return;
  }

  const { baseUrl = DEFAULT_BASE_URL, storagePath = DEFAULT_STORAGE_PATH } = config.local || {};

  fs.mkdirSync(storagePath, { recursive: true });

  return {
    getSrc: (mode, id, extension) => {
      if (isLocal(mode)) {
        const filename = `${id}.${extension}`;
        return `${baseUrl}/${filename}`;
      }

      if (isCloud(mode)) {
        // TODO
      }

      throw new Error('Image not found');
    },
    getDataFromRef: async ref => {
      const throwInvalidRefError = () => {
        throw new Error('Invalid image reference');
      };
      if (!parseImageRef(ref)) throwInvalidRefError();

      const { mode, id, extension } = parseImageRef(ref) as {
        mode: ImageMode;
        id: string;
        extension: ImageExtension;
      };

      if (isLocal(mode)) {
        const buffer = await fs.readFile(path.join(storagePath, `${id}.${extension}`));
        const metadata = await getImageMetadataFromBuffer(buffer);

        return {
          mode,
          id,
          ...metadata,
        };
      }

      if (isCloud(mode)) {
        // TODO
      }

      throw new Error('Unable to read image data from image reference');
    },
    getDataFromStream: async stream => {
      const { upload: mode } = config;
      const id = uuid();
      const chunks = [];

      for await (let chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      const metadata = await getImageMetadataFromBuffer(buffer);

      await fs.writeFile(path.join(storagePath, `${id}.${metadata.extension}`), buffer);

      return {
        mode,
        id,
        ...metadata,
      };
    },
  };
}
