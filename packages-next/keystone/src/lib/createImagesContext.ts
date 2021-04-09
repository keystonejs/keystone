import path from 'path';
import { KeystoneConfig, ImagesContext, ImageExtension, ImageMode } from '@keystone-next/types';
import { encode } from 'blurhash';
import { v4 as uuid } from 'uuid';
import fs from 'fs-extra';
import { fromBuffer } from 'file-type';
import imageSize from 'image-size';

const DEFAULT_BASE_URL = 'http://localhost:3000';
const DEFAULT_STORAGE_PATH = './public/images';
const BLURHASH_COMPONENT_X = 4;
const BLURHASH_COMPONENT_Y = 4;

const parseImageRef = (ref: string): { mode: ImageMode; id: string; ext: ImageExtension } => {
  if (!ref.includes(':') || !ref.includes('.')) {
    throw new Error('Invalid image reference');
  }

  const mode = ref.split(':')[0] as ImageMode;
  const ext = ref.split('.')[1] as ImageExtension;
  const id = mode.split('.')[0];

  return {
    mode,
    id,
    ext,
  };
};

const getImageMetadataFromBuffer = async (buffer: Buffer) => {
  const filesize = buffer.length;
  const fileType = await fromBuffer(buffer);
  if (!fileType) {
    throw new Error('File type not found');
  }
  const extension = fileType.ext === 'jpg' ? 'jpeg' : fileType.ext;
  if (extension !== 'jpeg' && extension !== 'png' && extension !== 'webp' && extension !== 'gif') {
    throw new Error(`${extension} is not a supported image type`);
  }

  const ext: ImageExtension = extension;

  const { height, width } = imageSize(buffer);

  if (width === undefined || height === undefined) {
    throw new Error('Height and width could not be found for image');
  }
  return { width, height, filesize, extension: ext };
};

const getBlurhashFromBuffer = async (
  buffer: Buffer,
  width: number,
  height: number
): Promise<string> => {
  return '';
  const blurhash = encode(
    new Uint8ClampedArray(buffer),
    width,
    height,
    BLURHASH_COMPONENT_X,
    BLURHASH_COMPONENT_Y
  );

  return blurhash;
};

const isLocal = (mode: ImageMode) => mode === 'local';

const isCloud = (mode: ImageMode) => mode !== 'local';

export function createImagesContext(config: KeystoneConfig['images']): ImagesContext | undefined {
  if (!config) {
    return;
  }

  const { baseUrl = '/images', storagePath = DEFAULT_STORAGE_PATH } = config.local || {};

  fs.mkdirSync(storagePath, { recursive: true });

  return {
    getSrc: (mode, id, ext) => {
      if (isLocal(mode)) {
        const filename = `${id}.${ext}`;
        const { baseUrl = DEFAULT_BASE_URL } = config.local || {};

        return `${baseUrl}/${filename}`;
      }

      if (isCloud(mode)) {
        // TODO
      }

      throw new Error('Image not found');
    },
    getRef: (mode, id, ext) => `${mode}:${id}.${ext}`,
    parseRef: ref => parseImageRef(ref),
    getDataFromRef: async ref => {
      const { mode, id, ext: extension } = parseImageRef(ref);

      if (isLocal(mode)) {
        const buffer = await fs.readFile(path.join(storagePath, `${id}.${extension}`));
        const metadata = await getImageMetadataFromBuffer(buffer);
        const blurhash = await getBlurhashFromBuffer(buffer, metadata.width, metadata.height);

        return {
          mode,
          id,
          ...metadata,
          blurhash,
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
      const blurhash = await getBlurhashFromBuffer(buffer, metadata.width, metadata.height);

      return {
        mode,
        id,
        ...metadata,
        blurhash,
      };
    },
  };
}
