import path from 'path';
import {
  KeystoneConfig,
  ImagesContext,
  ImageMetadata,
  AssetMode,
  ImageExtension,
} from '@keystone-next/types';
import { v4 as uuid } from 'uuid';
import fs from 'fs-extra';
import fromBuffer from 'image-type';
import imageSize from 'image-size';
import {
  buildKeystoneCloudImageSrc,
  getImageMetadataFromKeystoneCloud,
  uploadImageToKeystoneCloud,
} from '../keystone-cloud/assets';

const DEFAULT_BASE_URL = '/images';
const DEFAULT_STORAGE_PATH = './public/images';

const isLocalAsset = (mode: AssetMode) => mode === 'local';
const isKeystoneCloudAsset = (mode: AssetMode) => mode === 'keystone-cloud';

const IMAGEREGEX = /^(local|keystone-cloud):image:([^\\\/:\n]+)\.(gif|jpg|png|webp)$/;
export const parseImageRef = (
  ref: string
): { mode: AssetMode; id: string; extension: ImageExtension } | undefined => {
  const match = ref.match(IMAGEREGEX);
  if (match) {
    const [, mode, id, ext] = match;
    return {
      mode: mode as AssetMode,
      id,
      extension: ext as ImageExtension,
    };
  }
  return undefined;
};

const getImageMetadataFromBuffer = async (buffer: Buffer): Promise<ImageMetadata> => {
  const filesize = buffer.length;
  const fileType = fromBuffer(buffer);
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

  const extension = fileType.ext;

  const { height, width } = imageSize(buffer);

  if (width === undefined || height === undefined) {
    throw new Error('Height and width could not be found for image');
  }
  return { width, height, filesize, extension };
};

export function createImagesContext(config: KeystoneConfig): ImagesContext | undefined {
  if (!config.images) {
    return;
  }

  const { images, experimental } = config;
  const { baseUrl = DEFAULT_BASE_URL, storagePath = DEFAULT_STORAGE_PATH } = images.local || {};
  const {
    apiKey = '',
    imagesDomain = '',
    graphqlApiEndpoint = '',
    restApiEndpoint = '',
  } = experimental?.keystoneCloud || {};

  if (isLocalAsset(images.upload)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  return {
    getSrc: async (mode, id, extension) => {
      const filename = `${id}.${extension}`;

      if (isKeystoneCloudAsset(mode)) {
        return await buildKeystoneCloudImageSrc({
          apiKey,
          imagesDomain,
          graphqlApiEndpoint,
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

      if (isKeystoneCloudAsset(mode)) {
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

      if (isKeystoneCloudAsset(mode)) {
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
