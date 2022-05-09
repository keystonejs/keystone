import { v4 as uuid } from 'uuid';
import fromBuffer from 'image-type';
import imageSize from 'image-size';
import { KeystoneConfig, ImageMetadata, ImagesContext } from '../../types';
import { ImageAdapter } from './types';
import { localImageAssetsAPI } from './local';
import { s3ImageAssetsAPI } from './s3';

export const DEFAULT_BASE_IMAGE_URL = '/images';
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

export function createImagesContext(config: KeystoneConfig): ImagesContext {
  const imageAssetsAPIs = new Map<string, ImageAdapter>();
  for (const [storageKey, storageConfig] of Object.entries(config.storage || {})) {
    if (storageConfig.type !== 'image') break;
    imageAssetsAPIs.set(
      storageKey,
      storageConfig.kind === 'local'
        ? localImageAssetsAPI(storageConfig)
        : s3ImageAssetsAPI(storageConfig)
    );
  }

  return (storageString: string) => {
    const assetsAPI = imageAssetsAPIs.get(storageString);
    if (assetsAPI === undefined) {
      throw new Error(`No file assets API found for storage string "${storageString}"`);
    }

    return {
      getUrl: async (id, extension) => {
        return assetsAPI.url(id, extension);
      },
      getDataFromStream: async stream => {
        const id = uuid();
        const metadata = await assetsAPI.upload(stream, id);
        return { id, ...metadata };
      },
      deleteAtSource: assetsAPI.delete,
    };
  };
}
