import { v4 as uuid } from 'uuid';
import fromBuffer from 'image-type';
import imageSize from 'image-size';
import { KeystoneConfig, ImageMetadata, ImagesContext } from '../../types';
import { ImageAdapter } from './types';
import { localImageAssetsAPI } from './local';
import { s3ImageAssetsAPI } from './s3';
import { streamToBuffer } from './utils';

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
    if (storageConfig.type === 'image') {
      imageAssetsAPIs.set(
        storageKey,
        storageConfig.kind === 'local'
          ? localImageAssetsAPI(storageConfig)
          : s3ImageAssetsAPI(storageConfig)
      );
    }
  }

  return (storageString: string) => {
    const adapter = imageAssetsAPIs.get(storageString);
    if (adapter === undefined) {
      throw new Error(`No file assets API found for storage string "${storageString}"`);
    }

    return {
      getUrl: async (id, extension) => {
        return adapter.url(id, extension);
      },
      getDataFromStream: async (stream, originalFilename) => {
        const storageConfig = config.storage![storageString];
        const { transformName = () => uuid() } = storageConfig;

        const buffer = await streamToBuffer(stream);
        const { extension, ...rest } = getImageMetadataFromBuffer(buffer);

        const id = await transformName(originalFilename, extension);

        await adapter.upload(buffer, id, extension);
        return { id, extension, ...rest };
      },
      deleteAtSource: adapter.delete,
    };
  };
}
