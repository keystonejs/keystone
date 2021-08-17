import { Readable } from 'stream';
import { FileData } from '@keystone-next/types';
import { FileAdapter } from '@keystone-next/file-adapters';
import { parseFileRef } from '@keystone-next/utils';
import { generateSafeFilename } from '@keystone-next/file-adapters/src/utils';
import {
  buildKeystoneCloudFileSrc,
  getFileFromKeystoneCloud,
  uploadFileToKeystoneCloud,
} from './assets';

export type KeystoneCloudFileAdapterConfig = {
  apiKey: string;
  graphqlApiEndpoint: string;
  restApiEndpoint: string;
  transformFilename?: (str: string) => string;
};

export class KeystoneCloudFileAdapter extends FileAdapter {
  constructor(private config: KeystoneCloudFileAdapterConfig) {
    super();
  }
  getSrc(filename: string) {
    return buildKeystoneCloudFileSrc({
      apiKey: this.config.apiKey,
      graphqlApiEndpoint: this.config.graphqlApiEndpoint,
      filename,
    });
  }
  async getDataFromRef(ref: string): Promise<FileData> {
    const fileRef = parseFileRef(ref);

    if (!fileRef) {
      throw new Error('Invalid file reference');
    }
    const { filename } = fileRef;
    const { filesize } = await getFileFromKeystoneCloud({
      apiKey: this.config.apiKey,
      restApiEndpoint: this.config.restApiEndpoint,
      filename,
    });

    return { filesize, ...fileRef };
  }
  async getDataFromStream(stream: Readable, originalFilename: string): Promise<FileData> {
    const filename = generateSafeFilename(originalFilename, this.config.transformFilename);

    const { filesize } = await uploadFileToKeystoneCloud({
      apiKey: this.config.apiKey,
      restApiEndpoint: this.config.restApiEndpoint,
      stream,
      filename,
    });

    return { mode: 'keystone-cloud', filesize, filename };
  }
}
