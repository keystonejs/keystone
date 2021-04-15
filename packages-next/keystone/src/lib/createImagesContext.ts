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

const SUPPORTED_IMAGE_EXTENSIONS = ['jpeg', 'png', 'webp', 'gif'];
const MODE_LOCAL = 'local';
const DEFAULT_BASE_URL = '/images';
const DEFAULT_STORAGE_PATH = './public/images';

const isValidImageRef = (
  ref: string,
  mode: ImageMode,
  { storagePath }: { storagePath: string }
): boolean => {
  if (!ref.includes(MODE_LOCAL, 0)) {
    return false;
  }

  if (!ref.includes(':', MODE_LOCAL.length - 1)) {
    return false;
  }

  if (!ref.includes('.')) {
    return false;
  }

  if (isLocal(mode)) {
    return fs.existsSync(path.join(storagePath, ref.replace(`${MODE_LOCAL}:`, '')));
  }

  if (isCloud(mode)) {
    // TODO
    return false;
  }

  return false;
};

const isValidImageExtension = (extension: string): boolean =>
  SUPPORTED_IMAGE_EXTENSIONS.includes(extension);

const parseImageRef = (
  ref: string,
  config: { storagePath: string }
): { mode: ImageMode; id: string; extension: ImageExtension } => {
  const throwInvalidRefError = () => {
    throw new Error('Invalid image reference');
  };
  const [mode, idAndExt] = ref.split(':');
  const [id, ext] = idAndExt.split('.');

  if (!isValidImageRef(ref, mode as ImageMode, config)) {
    throwInvalidRefError();
  }

  if (!isValidImageExtension(ext)) {
    throwInvalidRefError();
  }

  return {
    mode: mode as ImageMode,
    id,
    extension: ext as ImageExtension,
  };
};

const getImageMetadataFromBuffer = async (buffer: Buffer) => {
  const filesize = buffer.length;
  const fileType = await fromBuffer(buffer);
  if (!fileType) {
    throw new Error('File type not found');
  }
  const ext = fileType.ext === 'jpg' ? 'jpeg' : fileType.ext;
  if (ext !== 'jpeg' && ext !== 'png' && ext !== 'webp' && ext !== 'gif') {
    throw new Error(`${ext} is not a supported image type`);
  }

  const extension: ImageExtension = ext;

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
    getRef: (mode, id, ext) => `${mode}:${id}.${ext}`,
    parseRef: ref => parseImageRef(ref, { storagePath }),
    getDataFromRef: async ref => {
      const { mode, id, extension } = parseImageRef(ref, { storagePath });

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
