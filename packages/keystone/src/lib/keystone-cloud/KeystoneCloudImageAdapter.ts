import { Readable } from 'stream';
import { v4 as uuid } from 'uuid';
import { ImageExtension, ImageData } from '@keystone-next/types';
import { parseImageRef } from '@keystone-next/utils';
import { ImageAdapter } from '@keystone-next/file-adapters';
import {
  buildKeystoneCloudImageSrc,
  getImageMetadataFromKeystoneCloud,
  uploadImageToKeystoneCloud,
} from './assets';

export type KeystoneCloudImageAdapterConfig = {
  apiKey: string;
  graphqlApiEndpoint: string;
  restApiEndpoint: string;
  imagesDomain: string;
};

export class KeystoneCloudImageAdapter extends ImageAdapter {
  constructor(private config: KeystoneCloudImageAdapterConfig) {
    super();
  }
  getSrc(id: string, extension: ImageExtension) {
    const filename = `${id}.${extension}`;
    return buildKeystoneCloudImageSrc({
      apiKey: this.config.apiKey,
      imagesDomain: this.config.imagesDomain,
      graphqlApiEndpoint: this.config.graphqlApiEndpoint,
      filename,
    });
  }
  async getDataFromRef(ref: string): Promise<ImageData> {
    const imageRef = parseImageRef(ref);

    if (!imageRef) {
      throw new Error('Invalid image reference');
    }

    const { id, extension } = imageRef;
    const filename = `${id}.${extension}`;
    const metadata = await getImageMetadataFromKeystoneCloud({
      filename,
      apiKey: this.config.apiKey,
      restApiEndpoint: this.config.restApiEndpoint,
    });

    return { ...imageRef, ...metadata };
  }
  async getDataFromStream(stream: Readable): Promise<ImageData> {
    const id = uuid();

    const metadata = await uploadImageToKeystoneCloud({
      apiKey: this.config.apiKey,
      stream,
      restApiEndpoint: this.config.restApiEndpoint,
      filename: id,
    });

    return { id, ...metadata };
  }
}
