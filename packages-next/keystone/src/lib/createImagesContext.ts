import { KeystoneConfig, ImagesContext, ImageExtension, ImageMode } from '@keystone-next/types';
import sharp from 'sharp';
import { encode } from 'blurhash';
import { v4 as uuid } from 'uuid';

const DEFAULT_BASE_URL = 'http://localhost:3000';
const DEFAULT_STORAGE_PATH = '/public/images';
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

const getImageMeta = async (input: string | Buffer) =>
  await sharp(input).toBuffer({ resolveWithObject: true });

const getBlurhashFromBuffer = async (buffer: Buffer, size: number = 32): Promise<string> => {
  const {
    info: { width, height },
  } = await sharp(buffer)
    .raw()
    .resize(size, size, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });
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
      const { storagePath = DEFAULT_STORAGE_PATH } = config.local || {};

      if (isLocal(mode)) {
        const file = `${storagePath}/${id}.${extension}`;
        const { data: buffer, info } = await getImageMeta(file);
        const { size: filesize, width, height } = info;
        const blurhash = await getBlurhashFromBuffer(buffer);

        return {
          mode,
          id,
          extension,
          filesize,
          width,
          height,
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
      const { info } = await getImageMeta(buffer);
      const { size: filesize, width, height, format } = info;
      const extension = format as ImageExtension;
      const blurhash = await getBlurhashFromBuffer(buffer);

      return {
        mode,
        id,
        extension,
        filesize,
        width,
        height,
        blurhash,
      };
    },
  };
}
